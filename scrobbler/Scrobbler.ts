/// <reference path="../definitions/typescript-node-definitions/winston.d.ts"/>
/// <reference path="../definitions/DefinitelyTyped/underscore/underscore.d.ts"/>

import lfmDao = require("./LastFmDao");
import scrap = require("./scrapers/Scraper");
import song = require("./Song");
import stat = require("./Station");
import usr = require("./User");

import _ = require("underscore");
import winston = require("winston");

// Constants
var LAST_UPDATE_TIMEOUT = 60 * 1000; // Amount of time failures can occur before the song that was playing is scrobbled
var MIN_SCROBBLE_TIME = 35 * 1000; // The minimum time a song has to play before it can be scrobbled

class ScrobblerStationData {
	public scraperName: string;
	public nowPlayingSong: song.Song;
	public lastScrobbledSong: song.Song;
	public lastUpdatedTime: number;

	constructor(scraperName: string) {
		this.scraperName = scraperName,
		this.nowPlayingSong = { Artist: null, Track: null };
		this.lastScrobbledSong = null;
		this.lastUpdatedTime = null;
	}
};

export class Scrobbler {
	private stationData:{ [index: string]: ScrobblerStationData; }
	private lastFmDao:lfmDao.LastFmDao;

	constructor(lastFmDao:lfmDao.LastFmDao) {
		this.lastFmDao = lastFmDao;
		this.stationData = {};
	}

	scrapeAndScrobble(scraper: scrap.Scraper, station:stat.Station, users:usr.User[], timestamp?:number): void {
		timestamp = timestamp || new Date().getTime();

		if (!scraper) {
			winston.error("Attempted to process invalid scraper:", scraper);  //todo fix this - make last.fm scraper that uses API
			return;
		}

		var scraperName = scraper.name;

		if (!station.Session) {
			winston.error("Attempted to process station with invalid station session:", station);
			return;
		}

		var stationData = this.stationData[scraperName];

		if (!stationData) {
			winston.info("New scraper found, initializing:", scraperName);
			stationData = new ScrobblerStationData(scraperName);
			this.stationData[scraperName] = stationData;
		}

		scraper.fetchAndParse((err, newSong:song.Song) => {
			if (err) {
				winston.error("Error scraping " + scraperName + ": " + err);
				if (this.lastUpdatedTooLongAgo(stationData, timestamp)) {
					this.scrobbleNowPlayingIfValid(stationData, station, users);
					stationData.nowPlayingSong = { Artist: null, Track: null, StartTime: timestamp };
					stationData.lastUpdatedTime = null;
				}
				return;
			}

			stationData.lastUpdatedTime = timestamp;

			if (!newSong || !stationData.nowPlayingSong || newSong.Artist != stationData.nowPlayingSong.Artist ||
				newSong.Track != stationData.nowPlayingSong.Track) {

				this.scrobbleNowPlayingIfValid(stationData, station, users);
				stationData.nowPlayingSong = { Artist: newSong.Artist, Track: newSong.Track, StartTime: timestamp };
			}
			this.postNowPlayingIfValid(stationData, station, users);
		});
	}

	private lastUpdatedTooLongAgo(stationData:ScrobblerStationData, timestamp:number) {
		return stationData.lastUpdatedTime && (stationData.lastUpdatedTime - timestamp < LAST_UPDATE_TIMEOUT);
	}

	private scrobbleNowPlayingIfValid(stationData:ScrobblerStationData, station:stat.Station, users:usr.User[]) {
		// Check song details
		if (!(stationData.nowPlayingSong && stationData.nowPlayingSong.Artist && stationData.nowPlayingSong.Track
			&& stationData.nowPlayingSong.StartTime)) {
			return;
		}

		// Check play time
		if (!(stationData.lastUpdatedTime
			&& (stationData.lastUpdatedTime - stationData.nowPlayingSong.StartTime > MIN_SCROBBLE_TIME))) {
			return;
		}

		// Make sure it's not the same as the one we scrobble last
		if (stationData.nowPlayingSong != null && stationData.lastScrobbledSong != null
			&& stationData.nowPlayingSong.Artist == stationData.lastScrobbledSong.Artist
			&& stationData.nowPlayingSong.Track == stationData.lastScrobbledSong.Track) {
			return;
		}

		stationData.lastScrobbledSong = stationData.nowPlayingSong;

		this.lastFmDao.scrobble(stationData.nowPlayingSong, station.StationName, station.Session);

		_.each(users, (user) => {
			this.lastFmDao.scrobble(stationData.nowPlayingSong, user.UserName, user.Session);
		});
	}

	private postNowPlayingIfValid(stationData:ScrobblerStationData, station:stat.Station, users:usr.User[]) {
		// Check song details
		if (!(stationData.nowPlayingSong && stationData.nowPlayingSong.Artist && stationData.nowPlayingSong.Track)) {
			return;
		}

		this.lastFmDao.postNowPlaying(stationData.nowPlayingSong, station.StationName, station.Session);

		_.each(users, (user) => {
			this.lastFmDao.postNowPlaying(stationData.nowPlayingSong, user.UserName, user.Session);
		});
	}
}
