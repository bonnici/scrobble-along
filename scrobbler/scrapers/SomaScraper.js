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

var SomaScraper = (function (_super) {
    __extends(SomaScraper, _super);
    function SomaScraper(name, station) {
        _super.call(this, name);
        this.url = "http://somafm.com/" + station + "/songhistory.html";
    }
    SomaScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        this.fetchUrl(this.url, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseHtml(body, callback);
        });
    };

    SomaScraper.prototype.parseHtml = function (body, callback) {
        if (!body) {
            winston.warn("SomaScraper: No HTML body");
            return callback(null, { Artist: null, Track: null });
        }

        var $ = cheerio.load(body);

        var playlistRows = $('#playinc table tr');

        if (playlistRows.length < 2) {
            winston.warn("SomaScraper: Not enough playlist rows (" + playlistRows.length + ")");
            return callback(null, { Artist: null, Track: null });
        }

        var firstSongRow = playlistRows.eq(2);

        if (firstSongRow.children("td").length < 3) {
            winston.warn("SomaScraper: Not enough playlist cols (" + firstSongRow.children("td").length + ")");
            return callback(null, { Artist: null, Track: null });
        }

        var time = firstSongRow.children("td").first().text();
        var artist = firstSongRow.children("td").eq(1).text();
        var song = firstSongRow.children("td").eq(2).text();

        if (!time || time == '' || !artist || artist == '' || !song || song == '') {
            winston.warn("SomaScraper: Invalid cols (" + time + "/" + artist + "/" + song + ")");
            return callback(null, { Artist: null, Track: null });
        }

        if (time.toLowerCase().indexOf("(now)") == -1) {
            winston.info("SomaScraper did not find a currently playing song");
            return callback(null, { Artist: null, Track: null });
        } else {
            winston.info("SomaScraper found song " + artist + " - " + song);
            return callback(null, { Artist: artist, Track: song });
        }
    };
    return SomaScraper;
})(scrap.Scraper);
exports.SomaScraper = SomaScraper;

//# sourceMappingURL=SomaScraper.js.map
