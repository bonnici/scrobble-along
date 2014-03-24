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
            winston.error("Attempted to process invalid scraper:", { scraper: scraper, station: station });
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

        var cb = function (err, newNowPlayingSong, justScrobbledSong) {
            if (err) {
                winston.error("Error scraping " + scraperName + ": " + err);
                if (_this.lastUpdatedTooLongAgo(stationData, timestamp)) {
                    _this.scrobbleNowPlayingIfValid(stationData, null, station, users);
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

            if (justScrobbledSong) {
                _this.scrobbleNowPlayingIfValid(stationData, justScrobbledSong, station, users);
            } else {
                if (!newNowPlayingSong || !stationData.nowPlayingSong || newNowPlayingSong.Artist != stationData.nowPlayingSong.Artist || newNowPlayingSong.Track != stationData.nowPlayingSong.Track) {
                    _this.scrobbleNowPlayingIfValid(stationData, null, station, users);
                    stationData.nowPlayingSong = {
                        Artist: newNowPlayingSong.Artist,
                        Track: newNowPlayingSong.Track,
                        StartTime: timestamp
                    };
                }
                _this.postNowPlayingIfValid(stationData, station, users);
            }
        };

        scraper.fetchAndParse(cb, station.ScraperParam);
    };

    Scrobbler.prototype.lastUpdatedTooLongAgo = function (stationData, timestamp) {
        return stationData.lastUpdatedTime && (stationData.lastUpdatedTime - timestamp < LAST_UPDATE_TIMEOUT);
    };

    Scrobbler.prototype.scrobbleNowPlayingIfValid = function (stationData, songToScrobble, station, users) {
        var _this = this;
        if (!songToScrobble) {
            songToScrobble = stationData.nowPlayingSong;

            if (!songToScrobble.StartTime || !stationData.lastUpdatedTime || stationData.lastUpdatedTime - songToScrobble.StartTime <= MIN_SCROBBLE_TIME) {
                return;
            }
        }

        if (!(songToScrobble && songToScrobble.Artist && songToScrobble.Track)) {
            return;
        }

        if (songToScrobble != null && stationData.lastScrobbledSong != null && songToScrobble.Artist == stationData.lastScrobbledSong.Artist && songToScrobble.Track == stationData.lastScrobbledSong.Track) {
            return;
        }

        stationData.lastScrobbledSong = songToScrobble;

        if (station.Session) {
            this.lastFmDao.scrobble(songToScrobble, station.StationName, station.Session);
        }

        _.each(users, function (user) {
            if (user) {
                _this.lastFmDao.scrobble(songToScrobble, user.UserName, user.Session);
            }
        });
    };

    Scrobbler.prototype.postNowPlayingIfValid = function (stationData, station, users) {
        var _this = this;
        if (!(stationData.nowPlayingSong && stationData.nowPlayingSong.Artist && stationData.nowPlayingSong.Track)) {
            return;
        }

        if (station.Session) {
            this.lastFmDao.postNowPlaying(stationData.nowPlayingSong, station.StationName, station.Session);
        }

        _.each(users, function (user) {
            if (user) {
                _this.lastFmDao.postNowPlaying(stationData.nowPlayingSong, user.UserName, user.Session);
            }
        });
    };
    return Scrobbler;
})();
exports.Scrobbler = Scrobbler;

//# sourceMappingURL=Scrobbler.js.map
