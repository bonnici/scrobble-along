/// <reference path="../definitions/typescript-node-definitions/winston.d.ts"/>
/// <reference path="../definitions/DefinitelyTyped/underscore/underscore.d.ts"/>






var _ = require("underscore");
var winston = require("winston");

// Constants
var LAST_UPDATE_TIMEOUT = 60 * 1000;
var MIN_SCROBBLE_TIME = 35 * 1000;

var ScrobblerStationData = (function () {
    function ScrobblerStationData(scraperName) {
        this.scraperName = scraperName, this.nowPlayingSong = { Artist: null, Track: null };
        this.lastScrobbledSong = null;
        this.lastUpdatedTime = null;
    }
    return ScrobblerStationData;
})();
;

var Scrobbler = (function () {
    function Scrobbler(lastFmDao) {
        this.lastFmDao = lastFmDao;
        this.stationData = {};
    }
    Scrobbler.prototype.scrapeAndScrobble = function (scraper, station, users, timestamp) {
        var _this = this;
        timestamp = timestamp || new Date().getTime();

        if (!scraper) {
            winston.error("Attempted to process invalid scraper:", scraper);
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

        scraper.fetchAndParse(function (err, newSong) {
            if (err) {
                winston.error("Error scraping " + scraperName + ": " + err);
                if (_this.lastUpdatedTooLongAgo(stationData, timestamp)) {
                    _this.scrobbleNowPlayingIfValid(stationData, station, users);
                    stationData.nowPlayingSong = { Artist: null, Track: null, StartTime: timestamp };
                    stationData.lastUpdatedTime = null;
                }
                return;
            }

            stationData.lastUpdatedTime = timestamp;

            if (!newSong || !stationData.nowPlayingSong || newSong.Artist != stationData.nowPlayingSong.Artist || newSong.Track != stationData.nowPlayingSong.Track) {
                _this.scrobbleNowPlayingIfValid(stationData, station, users);
                stationData.nowPlayingSong = { Artist: newSong.Artist, Track: newSong.Track, StartTime: timestamp };
            }
            _this.postNowPlayingIfValid(stationData, station, users);
        });
    };

    Scrobbler.prototype.lastUpdatedTooLongAgo = function (stationData, timestamp) {
        return stationData.lastUpdatedTime && (stationData.lastUpdatedTime - timestamp < LAST_UPDATE_TIMEOUT);
    };

    Scrobbler.prototype.scrobbleNowPlayingIfValid = function (stationData, station, users) {
        var _this = this;
        if (!(stationData.nowPlayingSong && stationData.nowPlayingSong.Artist && stationData.nowPlayingSong.Track && stationData.nowPlayingSong.StartTime)) {
            return;
        }

        if (!(stationData.lastUpdatedTime && (stationData.lastUpdatedTime - stationData.nowPlayingSong.StartTime > MIN_SCROBBLE_TIME))) {
            return;
        }

        if (stationData.nowPlayingSong != null && stationData.lastScrobbledSong != null && stationData.nowPlayingSong.Artist == stationData.lastScrobbledSong.Artist && stationData.nowPlayingSong.Track == stationData.lastScrobbledSong.Track) {
            return;
        }

        stationData.lastScrobbledSong = stationData.nowPlayingSong;

        this.lastFmDao.scrobble(stationData.nowPlayingSong, station.StationName, station.Session);

        //todo serialize? check that this works IRL
        _.each(users, function (user) {
            _this.lastFmDao.scrobble(stationData.nowPlayingSong, user.UserName, user.Session);
        });
    };

    Scrobbler.prototype.postNowPlayingIfValid = function (stationData, station, users) {
        var _this = this;
        if (!(stationData.nowPlayingSong && stationData.nowPlayingSong.Artist && stationData.nowPlayingSong.Track)) {
            return;
        }

        this.lastFmDao.postNowPlaying(stationData.nowPlayingSong, station.StationName, station.Session);

        //todo serialize? check that this works IRL
        _.each(users, function (user) {
            _this.lastFmDao.postNowPlaying(stationData.nowPlayingSong, user.UserName, user.Session);
        });
    };
    return Scrobbler;
})();
exports.Scrobbler = Scrobbler;

//# sourceMappingURL=Scrobbler.js.map
