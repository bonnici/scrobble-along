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

var C895Scraper = (function (_super) {
    __extends(C895Scraper, _super);
    function C895Scraper(name) {
        _super.call(this, name);
        this.url = "http://www.c895.org/playlist/";
    }
    C895Scraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        this.fetchUrl(this.url, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseHtml(body, callback);
        });
    };

    C895Scraper.prototype.parseHtml = function (body, callback) {
        if (!body) {
            winston.warn("C895Scraper: No HTML body");
            return callback(null, { Artist: null, Track: null });
        }

        var $ = cheerio.load(body);

        var playlistRows = $('table#playlist tr');

        if (playlistRows.length < 1) {
            winston.warn("C895Scraper: Not enough playlist rows (" + playlistRows.length + ")");
            return callback(null, { Artist: null, Track: null });
        }

        var firstSongRow = playlistRows.eq(1);

        if (firstSongRow.children("td").length < 3) {
            winston.warn("C895Scraper: Not enough playlist cols (" + firstSongRow.children("td").length + ")");
            return callback(null, { Artist: null, Track: null });
        }

        var artist = firstSongRow.children("td").eq(1).text();
        var song = firstSongRow.children("td").eq(2).text();

        if (firstSongRow.children("td").length >= 3) {
            var mix = firstSongRow.children("td").eq(3).text();
            if (mix) {
                song += " (" + mix + ")";
            }
        }

        if (!artist || artist == '' || !song || song == '') {
            winston.warn("C895Scraper: Invalid cols (" + artist + "/" + song + ")");
            return callback(null, { Artist: null, Track: null });
        }

        winston.info("C895Scraper found song " + artist + " - " + song);
        return callback(null, { Artist: artist, Track: song });
    };
    return C895Scraper;
})(scrap.Scraper);
exports.C895Scraper = C895Scraper;

//# sourceMappingURL=C895Scraper.js.map
