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
			winston.error("Attempted to process invalid scraper:", {scraper: scraper, station: station});
			return;
		}

		if (!station) {
			winston.error("Attempted to process invalid station:", station);
			return;
		}

		var scraperName = scraper.name;

		var stationData = this.stationData[scraperName];

		if (!stationData) {
			winston.info("New scraper found, initializing:", scraperName);
			stationData = new ScrobblerStationData(scraperName);
			this.stationData[scraperName] = stationData;
		}

		var cb = (err, newNowPlayingSong:song.Song, justScrobbledSong?:song.Song) => {
			if (err) {
				winston.error("Error scraping " + scraperName + ": " + err);
				if (this.lastUpdatedTooLongAgo(stationData, timestamp)) {
					this.scrobbleNowPlayingIfValid(stationData, null, station, users);
					stationData.nowPlayingSong = { Artist: null, Track: null, StartTime: timestamp };
					stationData.lastUpdatedTime = null;
				}
				return;
			}

			if (justScrobbledSong && newNowPlayingSong) {
				winston.error("Only one of newNowPlayingSong and justScrobbledSong should be set");
				return;
			}

			stationData.lastUpdatedTime = timestamp;

			// justScrobbledSong should be set if the scraper can't figure out what is currently playing
			if (justScrobbledSong) {
				this.scrobbleNowPlayingIfValid(stationData, justScrobbledSong, station, users);
			}
			else {
				if (!newNowPlayingSong || !stationData.nowPlayingSong ||
					newNowPlayingSong.Artist != stationData.nowPlayingSong.Artist ||
					newNowPlayingSong.Track != stationData.nowPlayingSong.Track) {

					this.scrobbleNowPlayingIfValid(stationData, null, station, users);
					stationData.nowPlayingSong = {
						Artist: newNowPlayingSong.Artist,
						Track: newNowPlayingSong.Track,
						StartTime: timestamp };
				}
				this.postNowPlayingIfValid(stationData, station, users);
			}
		};

		scraper.fetchAndParse(cb, station.ScraperParam);
	}

	private lastUpdatedTooLongAgo(stationData:ScrobblerStationData, timestamp:number) {
		return stationData.lastUpdatedTime && (stationData.lastUpdatedTime - timestamp < LAST_UPDATE_TIMEOUT);
	}

	private scrobbleNowPlayingIfValid(stationData:ScrobblerStationData, songToScrobble:song.Song,
		station:stat.Station, users:usr.User[]) {

		if (!songToScrobble) {
			songToScrobble = stationData.nowPlayingSong;

			// If we are scrobbling the now playing song, check play time
			if (!songToScrobble.StartTime || !stationData.lastUpdatedTime ||
				stationData.lastUpdatedTime - songToScrobble.StartTime <= MIN_SCROBBLE_TIME) {
				return;
			}
		}

		// Check song details
		if (!(songToScrobble && songToScrobble.Artist && songToScrobble.Track)) {
			return;
		}

		// Make sure it's not the same as the one we scrobbled last
		if (songToScrobble != null && stationData.lastScrobbledSong != null
			&& songToScrobble.Artist == stationData.lastScrobbledSong.Artist
			&& songToScrobble.Track == stationData.lastScrobbledSong.Track) {
			return;
		}

		stationData.lastScrobbledSong = songToScrobble;

		if (station.Session) {
			this.lastFmDao.scrobble(songToScrobble, station.StationName, station.Session);
		}

		_.each(users, (user) => {
			if (user) {
				this.lastFmDao.scrobble(songToScrobble, user.UserName, user.Session);
			}
		});
	}

	private postNowPlayingIfValid(stationData:ScrobblerStationData, station:stat.Station, users:usr.User[]) {
		// Check song details
		if (!(stationData.nowPlayingSong && stationData.nowPlayingSong.Artist && stationData.nowPlayingSong.Track)) {
			return;
		}

		if (station.Session) {
			this.lastFmDao.postNowPlaying(stationData.nowPlayingSong, station.StationName, station.Session);
		}

		_.each(users, (user) => {
			if (user) {
				this.lastFmDao.postNowPlaying(stationData.nowPlayingSong, user.UserName, user.Session);
			}
		});
	}
}
