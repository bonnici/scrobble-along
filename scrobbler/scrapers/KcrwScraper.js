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

var KcrwScraper = (function (_super) {
    __extends(KcrwScraper, _super);
    function KcrwScraper(name) {
        _super.call(this, name);
        this.url = "http://newmedia.kcrw.com/tracklists/index.php?channel=Live";
    }
    KcrwScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        this.fetchUrl(this.url, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseHtml(body, callback);
        });
    };

    KcrwScraper.prototype.parseHtml = function (body, callback) {
        if (!body) {
            winston.warn("KcrwScraper: No HTML body");
            return callback(null, { Artist: null, Track: null });
        }

        var $ = cheerio.load(body);

        var playlistRows = $("table#table_tracklist tbody tr");

        if (playlistRows.length < 1) {
            winston.warn("KcrwScraper: Not enough playlist rows (" + playlistRows.length + ")");
            return callback(null, { Artist: null, Track: null });
        }

        var firstSongRow = playlistRows.eq(0);

        if (firstSongRow.children("td").length < 3) {
            winston.warn("KcrwScraper: Not enough playlist cols (" + firstSongRow.children("td").length + ")");
            return callback(null, { Artist: null, Track: null });
        }

        var artist = firstSongRow.children("td").eq(1).text();
        var song = firstSongRow.children("td").eq(2).text();

        if (!artist || artist == '' || !song || song == '' || artist == 'Break' || song == "Break") {
            winston.warn("KcrwScraper: Invalid cols (" + artist + "/" + song + ")");
            return callback(null, { Artist: null, Track: null });
        }

        winston.info("KcrwScraper found song " + artist + " - " + song);
        return callback(null, { Artist: artist, Track: song });
    };
    return KcrwScraper;
})(scrap.Scraper);
exports.KcrwScraper = KcrwScraper;

//# sourceMappingURL=KcrwScraper.js.map
