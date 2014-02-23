




//import _ = require("underscore");
var winston = require("winston");

// Constants
var UNKNOWN_SONG = { Artist: null, Track: null };
var LAST_UPDATE_TIMEOUT = 60 * 1000;
var MIN_SCROBBLE_TIME = 35 * 1000;

var ScrobblerStationData = (function () {
    function ScrobblerStationData(scraperName) {
        this.scraperName = scraperName, this.nowPlayingSong = UNKNOWN_SONG;
        this.nowPlayingStarted = null;
        this.lastScrobbledSong = null;
        this.lastUpdatedTime = null;
    }
    return ScrobblerStationData;
})();
;

var Scrobbler = (function () {
    function Scrobbler(scrapers, lastFmDao) {
        this.scrapers = scrapers;
        this.lastFmDao = lastFmDao;
        this.stationData = {};
    }
    Scrobbler.prototype.scrapeAndScrobble = function (stations, timestamp) {
        timestamp = timestamp || new Date().getTime();

        for (var i = 0; i < stations.length; i++) {
            var scraperName = stations[i].ScraperName;
            this.processScraper(scraperName, timestamp);
        }
    };

    Scrobbler.prototype.processScraper = function (scraperName, timestamp) {
        var _this = this;
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

        scraper.fetchAndParse(function (err, newSong) {
            if (err) {
                winston.error("Error scraping " + scraperName + ": " + err);
                if (_this.lastUpdatedTooLongAgo(stationData, timestamp)) {
                    _this.scrobbleNowPlayingIfValid(stationData, timestamp);
                    stationData.nowPlayingSong = UNKNOWN_SONG;
                    stationData.nowPlayingStarted = timestamp;
                    stationData.lastUpdatedTime = null;
                }
                return;
            }

            stationData.lastUpdatedTime = timestamp;

            if (newSong != stationData.nowPlayingSong) {
                _this.scrobbleNowPlayingIfValid(stationData, timestamp);
                stationData.nowPlayingSong = newSong;
                stationData.nowPlayingStarted = timestamp;
            }
            _this.postNowPlayingIfValid(stationData, timestamp);
        });
    };

    Scrobbler.prototype.lastUpdatedTooLongAgo = function (stationData, timestamp) {
        return stationData.lastUpdatedTime && (stationData.lastUpdatedTime - timestamp < LAST_UPDATE_TIMEOUT);
    };

    Scrobbler.prototype.scrobbleNowPlayingIfValid = function (stationData, timestamp) {
        var songOk = stationData.nowPlayingSong && stationData.nowPlayingSong != UNKNOWN_SONG && stationData.nowPlayingSong.Artist && stationData.nowPlayingSong.Track;

        var playTimeOk = stationData.lastUpdatedTime && (stationData.lastUpdatedTime - stationData.nowPlayingStarted > MIN_SCROBBLE_TIME);

        var notJustScrobbled = stationData.nowPlayingSong != stationData.lastScrobbledSong;

        if (songOk && playTimeOk && notJustScrobbled) {
            this.lastFmDao.scrobble(stationData.nowPlayingSong);
            stationData.lastScrobbledSong = stationData.nowPlayingSong;
        }
    };

    Scrobbler.prototype.postNowPlayingIfValid = function (stationData, timestamp) {
        var songOk = stationData.nowPlayingSong && stationData.nowPlayingSong != UNKNOWN_SONG && stationData.nowPlayingSong.Artist && stationData.nowPlayingSong.Track;

        if (songOk) {
            this.lastFmDao.postNowPlaying(stationData.nowPlayingSong);
        }
    };
    return Scrobbler;
})();
exports.Scrobbler = Scrobbler;

//# sourceMappingURL=Scrobbler.js.map
