/// <reference path="../../definitions/dummy-definitions/cheerio.d.ts"/>
/// <reference path="../../definitions/dummy-definitions/moment-timezone.d.ts"/>
/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var scrap = require("./Scraper");


var cheerio = require("cheerio");
var moment = require('moment-timezone');
var util = require("util");
var winston = require("winston");

var KexpScraper = (function (_super) {
    __extends(KexpScraper, _super);
    function KexpScraper(name, baseUrl) {
        _super.call(this, name);
        this.defaultStartTime = null;
        this.baseUrl = baseUrl || "http://kexp.org/playlist/playlistupdates?channel=1&start=%s&since=%s";
    }
    KexpScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        var fullUrl = util.format(this.baseUrl, this.startTime(), this.startTime());

        this.fetchUrl(fullUrl, function (err, body) {
            if (err)
                return callback(err, null);

            return _this.parse(body, callback);
        });
    };

    // Separated so that it is mockable
    KexpScraper.prototype.startTime = function () {
        return this.defaultStartTime || moment().tz("America/Los_Angeles").subtract('minutes', 30).format("YYYY-MM-DDTHH:mm:ss.SSS");
    };

    KexpScraper.prototype.parse = function (body, callback) {
        var $ = cheerio.load(body);
        var nowPlayingDiv = $.root().children('div').first();

        if (nowPlayingDiv.hasClass("AirBreak")) {
            winston.info("KexpScraper found an air break");
            return callback(null, { Artist: null, Track: null });
        } else if (nowPlayingDiv.hasClass("Play")) {
            var artist = nowPlayingDiv.find("div.ArtistName").text();
            var track = nowPlayingDiv.find("div.TrackName").text();

            if (artist && track) {
                winston.info("KexpScraper found song " + artist + " - " + track);
                return callback(null, { Artist: artist, Track: track });
            }
        }

        winston.info("KexpScraper could not find a song");
        return callback(null, { Artist: null, Track: null });
    };
    return KexpScraper;
})(scrap.Scraper);
exports.KexpScraper = KexpScraper;

//# sourceMappingURL=KexpScraper.js.map
