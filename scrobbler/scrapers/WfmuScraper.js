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

var WfmuScraper = (function (_super) {
    __extends(WfmuScraper, _super);
    function WfmuScraper(name) {
        _super.call(this, name);
        this.url = "http://wfmu.org/currentliveshows_aggregator.php?ch=1";
    }
    /*
    Example (cutdown):
    
    <div id="nowplaysong">
    <div id="nowplaying">
    <div class="bigline">
    <span class="KDBFavIcon KDBsong" id="KDBsong-1354099">
    <a href="http://www.wfmu.org/auth.php?a=fav_icon_clicked&amp;type=song&amp;id=1354099&amp;page_type=homepage&amp;page_id=1&amp;r=http%3A%2F%2Fwww.wfmu.org%2F"
    onclick="KDBFav.fav_icon_clicked(event, this.parentNode);"
    title="Click for options"
    ><img src="/Gfx/star_empty_2.png" border="0" alt="Options" /></a>
    </span>
    &quot;Down &amp; To The Left&quot;
    by
    Amon Tobin
    </div>
    </div>
    </div>
    */
    WfmuScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        this.fetchUrl(this.url, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseHtml(body, callback);
        });
    };

    WfmuScraper.prototype.parseHtml = function (body, callback) {
        if (!body) {
            winston.warn("WfmuScraper: No HTML body");
            return callback(null, { Artist: null, Track: null });
        }

        var $ = cheerio.load(body);

        var songDiv = $('div#nowplaysong div#nowplaying div.bigline');

        if (songDiv.length < 1) {
            winston.warn("WfmuScraper: No song div", { songDivLength: songDiv.length });
            return callback(null, { Artist: null, Track: null });
        }

        var songText = songDiv.eq(0).text();

        if (!songText.trim()) {
            winston.warn("WfmuScraper: Blank text", { songText: songText });
            return callback(null, { Artist: null, Track: null });
        }

        songText = songText.trim();

        // Text should be of the form "title" by artist
        var firstQuote = songText.indexOf('"');
        var lastQuote = songText.lastIndexOf('"');

        if (firstQuote != 0 || lastQuote <= 0 || songText.length <= lastQuote + 4) {
            winston.warn("WfmuScraper: Invalid text", { songText: songText });
            return callback(null, { Artist: null, Track: null });
        }

        var byText = songText.substring(lastQuote + 1, lastQuote + 5);
        if (byText != "\nby\n") {
            winston.warn("WfmuScraper: Invalid text [" + byText + "]");
            return callback(null, { Artist: null, Track: null });
        }

        var titleText = songText.substring(1, lastQuote).trim();
        var artistText = songText.substring(lastQuote + 4).trim();

        if (artistText && titleText) {
            winston.info("WfmuScraper found song " + artistText + " - " + titleText);
            return callback(null, { Artist: artistText, Track: titleText });
        } else {
            winston.info("WfmuScraper could not find song");
            return callback(null, { Artist: null, Track: null });
        }
    };
    return WfmuScraper;
})(scrap.Scraper);
exports.WfmuScraper = WfmuScraper;

//# sourceMappingURL=WfmuScraper.js.map
