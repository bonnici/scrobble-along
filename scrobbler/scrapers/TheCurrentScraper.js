/// <reference path="../../definitions/dummy-definitions/cheerio.d.ts"/>
/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var scrap = require("./Scraper");


var cheerio = require("cheerio");
var winston = require("winston");

var TheCurrentScraper = (function (_super) {
    __extends(TheCurrentScraper, _super);
    function TheCurrentScraper(name) {
        _super.call(this, name);
        this.url = "http://www.thecurrent.org/playlist";
    }
    TheCurrentScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        this.fetchUrl(this.url, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseHtml(body, callback);
        });
    };

    TheCurrentScraper.prototype.parseHtml = function (body, callback) {
        if (!body) {
            winston.warn("TheCurrentScraper: No HTML body");
            return callback(null, { Artist: null, Track: null });
        }

        var $ = cheerio.load(body);

        var playlistRows = $('li#playlist li div.songDetails');

        if (playlistRows.length < 1) {
            winston.info("TheCurrentScraper could not find song");
            return callback(null, { Artist: null, Track: null });
        }

        var artist = playlistRows.first().find('h5.artist').text();
        var song = playlistRows.first().find('h5.title').text();

        if (!artist || !song) {
            winston.info("TheCurrentScraper could not find song");
            return callback(null, { Artist: null, Track: null });
        }

        artist = artist.trim();
        song = song.trim();

        if (!artist || !song) {
            winston.info("TheCurrentScraper could not find song");
            return callback(null, { Artist: null, Track: null });
        } else {
            winston.info("TheCurrentScraper found song " + artist + " - " + song);
            return callback(null, { Artist: artist, Track: song });
        }
    };
    return TheCurrentScraper;
})(scrap.Scraper);
exports.TheCurrentScraper = TheCurrentScraper;

//# sourceMappingURL=TheCurrentScraper.js.map
