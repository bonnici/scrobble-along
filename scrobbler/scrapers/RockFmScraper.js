/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var scrap = require("./CheerioScraper");


var winston = require("winston");

var RockFmScraper = (function (_super) {
    __extends(RockFmScraper, _super);
    function RockFmScraper(name) {
        _super.call(this, name);
        this.url = "http://www.rockfm.co.uk";
    }
    RockFmScraper.prototype.getUrl = function () {
        return this.url;
    };

    RockFmScraper.prototype.parseCheerio = function ($, callback) {
        var nowPlayingSpans = $('#now-playing-track span');

        if (nowPlayingSpans.length < 3) {
            winston.warn("RockFmScraper: Not enough now playing spans (" + nowPlayingSpans.length + ")");
            callback(null, { Artist: null, Track: null });
            return;
        }

        var artist = nowPlayingSpans.eq(1).text();
        var song = nowPlayingSpans.eq(2).text();

        if (!artist || !song) {
            winston.warn("RockFmScraper: Invalid artist or song (" + artist + "/" + song + ")");
            callback(null, { Artist: null, Track: null });
        } else {
            callback(null, { Artist: artist, Track: song });
        }
        /*
        var playlistRows = $('#playinc table tr');
        
        if (playlistRows.length < 2) {
        winston.warn("SomaScraper: Not enough playlist rows (" + playlistRows.length + ")");
        callback(null, { Artist: null, Track: null });
        return;
        }
        
        var firstSongRow = playlistRows.eq(2);
        
        if (firstSongRow.children("td").length < 3) {
        winston.warn("SomaScraper: Not enough playlist cols (" + firstSongRow.children("td").length + ")");
        callback(null, { Artist: null, Track: null });
        return;
        }
        
        var time = firstSongRow.children("td").first().text();
        var artist = firstSongRow.children("td").eq(1).text();
        var song = firstSongRow.children("td").eq(2).text();
        
        if (!time || time == '' || !artist || artist == '' || !song || song == '') {
        winston.warn("SomaScraper: Invalid cols (" + time + "/" + artist + "/" + song + ")");
        callback(null, { Artist: null, Track: null });
        return;
        }
        
        if (time.toLowerCase().indexOf("(now)") == -1) {
        winston.info("SomaScraper did not find a currently playing song");
        callback(null, { Artist: null, Track: null });
        }
        else {
        winston.info("SomaScraper found song " + artist + " - " + song);
        callback(null, { Artist: artist, Track: song });
        }
        */
    };
    return RockFmScraper;
})(scrap.CheerioScraper);
exports.RockFmScraper = RockFmScraper;

//# sourceMappingURL=RockFmScraper.js.map
