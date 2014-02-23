import lfmDao = require("./LastFmDao");
import scrap = require("./scrapers/Scraper");
import song = require("./Song");
import stat = require("./Station");

//import _ = require("underscore");
import winston = require("winston");

// Constants
var UNKNOWN_SONG = { Artist: null, Track: null };
var LAST_UPDATE_TIMEOUT = 60 * 1000; // Amount of time failures can occur before the song that was playing is scrobbled
var MIN_SCROBBLE_TIME = 35 * 1000; // The minimum time a song has to play before it can be scrobbled

class ScrobblerStationData {
	public scraperName: string;
	public nowPlayingSong: song.Song;
	public nowPlayingStarted: number; // timestamp
	public lastScrobbledSong: song.Song;
	public lastUpdatedTime: number;

	constructor(scraperName: string) {
		this.scraperName = scraperName,
		this.nowPlayingSong = UNKNOWN_SONG;
		this.nowPlayingStarted = null;
		this.lastScrobbledSong = null;
		this.lastUpdatedTime = null;
	}
};

export class Scrobbler {
	private stationData:{ [index: string]: ScrobblerStationData; }
	private scrapers:{ [index: string]: scrap.Scraper; }
	private lastFmDao:lfmDao.LastFmDao;

	constructor(scrapers:{ [index: string]: scrap.Scraper; }, lastFmDao:lfmDao.LastFmDao) {
		this.scrapers = scrapers;
		this.lastFmDao = lastFmDao;
		this.stationData = {};
	}

	scrapeAndScrobble(stations:stat.Station[], timestamp?:number): void {
		timestamp = timestamp || new Date().getTime();

		for (var i = 0; i < stations.length; i++) {
			var scraperName = stations[i].ScraperName;
			this.processScraper(scraperName, timestamp);
		}
	}

	private processScraper(scraperName:string, timestamp:number): void {
		var scraper = this.scrapers[scraperName];
		var stationData = this.stationData[scraperName];

		if (!scraper) {
			winston.error("Attempted to process invalid scraper:", scraperName);
			return;
		}

		if (!stationData) {
			winston.info("New scraper found, initializing:", scraperName);
			stationData = new ScrobblerStationData(scraperName);
			this.stationData[scraperName] = stationData;
		}

		scraper.fetchAndParse((err, newSong) => {
			if (err) {
				winston.error("Error scraping " + scraperName + ": " + err);
				if (this.lastUpdatedTooLongAgo(stationData, timestamp)) {
					this.scrobbleNowPlayingIfValid(stationData, timestamp);
					stationData.nowPlayingSong = UNKNOWN_SONG;
					stationData.nowPlayingStarted = timestamp;
					stationData.lastUpdatedTime = null;
				}
				return;
			}

			stationData.lastUpdatedTime = timestamp;

			if (!newSong || !stationData.nowPlayingSong || newSong.Artist != stationData.nowPlayingSong.Artist ||
				newSong.Track != stationData.nowPlayingSong.Track) {

				this.scrobbleNowPlayingIfValid(stationData, timestamp);
				stationData.nowPlayingSong = newSong;
				stationData.nowPlayingStarted = timestamp;
			}
			this.postNowPlayingIfValid(stationData, timestamp);
		});
	}

	private lastUpdatedTooLongAgo(stationData:ScrobblerStationData, timestamp:number) {
		return stationData.lastUpdatedTime && (stationData.lastUpdatedTime - timestamp < LAST_UPDATE_TIMEOUT);
	}

	private scrobbleNowPlayingIfValid(stationData:ScrobblerStationData, timestamp:number) {
		var songOk = stationData.nowPlayingSong && stationData.nowPlayingSong != UNKNOWN_SONG
			&& stationData.nowPlayingSong.Artist && stationData.nowPlayingSong.Track;

		var playTimeOk = stationData.lastUpdatedTime
			&& (stationData.lastUpdatedTime - stationData.nowPlayingStarted > MIN_SCROBBLE_TIME);

		var notJustScrobbled = stationData.nowPlayingSong != stationData.lastScrobbledSong;

		if (songOk && playTimeOk && notJustScrobbled) {
			this.lastFmDao.scrobble(stationData.nowPlayingSong);
			stationData.lastScrobbledSong = stationData.nowPlayingSong;
		}
	}

	private postNowPlayingIfValid(stationData:ScrobblerStationData, timestamp:number) {
		var songOk = stationData.nowPlayingSong && stationData.nowPlayingSong != UNKNOWN_SONG
			&& stationData.nowPlayingSong.Artist && stationData.nowPlayingSong.Track;

		if (songOk) {
			this.lastFmDao.postNowPlaying(stationData.nowPlayingSong);
		}
	}
}
