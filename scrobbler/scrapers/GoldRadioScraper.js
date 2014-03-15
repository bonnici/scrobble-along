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

var GoldRadioScraper = (function (_super) {
    __extends(GoldRadioScraper, _super);
    function GoldRadioScraper(name) {
        _super.call(this, name);
        this.url = "http://www.mygoldmusic.co.uk/jsfiles/NowPlayingDisplay.aspx?f=http%3A%2F%2Frope%2Eicgo%2Efimc%2Enet%2FFeeds%2FNowPlaying%2FGCap%5FMedia%2FGold%5FNetwork%2FGold%5FLondon%2F5853%2Exml&l=5853&tzc=8";
    }
    GoldRadioScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        this.fetchUrl(this.url, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseHtml(body, callback);
        });
    };

    GoldRadioScraper.prototype.parseHtml = function (body, callback) {
        if (!body) {
            winston.warn("GoldRadioScraper: No HTML body");
            return callback(null, { Artist: null, Track: null });
        }

        /*
        e.g.
        <div id="RcsPlayingPrevTitle"></div>
        <div id="RcsPlayingPrevArtist"></div>
        <div id="RcsPlayingPrevSong"></div>
        <div id="RcsPlayingNowTitle">playing now:</div>
        <div id="RcsPlayingNowArtist">Procul Harum,</div>
        <div id="RcsPlayingNowSong">A Whiter Shade Of Pale</div>
        <div id="RcsPlayingNextTitle"></div>
        <div id="RcsPlayingNextArtist"></div>
        <div id="RcsPlayingNextSong"></div>
        <div id="RcsNextInSeconds">229</div>
        */
        var $ = cheerio.load(body);

        var artistDiv = $('div#RcsPlayingNowArtist');
        var songDiv = $('div#RcsPlayingNowSong');

        if (artistDiv.length < 1 || songDiv.length < 1) {
            winston.warn("GoldRadioScraper: No artist or song div", { artistDivLength: artistDiv.length, songDivLength: songDiv.length });
            return callback(null, { Artist: null, Track: null });
        }

        var artistText = artistDiv.eq(0).text();
        var titleText = songDiv.eq(0).text();

        if (!artistText.trim() || !titleText.trim()) {
            winston.warn("GoldRadioScraper: Blank artist or title", { artistText: artistText, titleText: titleText });
            return callback(null, { Artist: null, Track: null });
        }

        // artist includes a trailing comma so substring it out
        artistText = artistText.substring(0, artistText.length - 1);

        artistText = artistText.trim();
        titleText = titleText.trim();

        if (artistText && titleText) {
            winston.info("GoldRadioScraper found song " + artistText + " - " + titleText);
            return callback(null, { Artist: artistText, Track: titleText });
        } else {
            winston.info("GoldRadioScraper could not find song");
            return callback(null, { Artist: null, Track: null });
        }
    };
    return GoldRadioScraper;
})(scrap.Scraper);
exports.GoldRadioScraper = GoldRadioScraper;

//# sourceMappingURL=GoldRadioScraper.js.map
