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

var XfmScraper = (function (_super) {
    __extends(XfmScraper, _super);
    /*
    Cutdown example:
    <div id="on_radio" class="facet selected_facet">
    <div class="track_list">
    <ul>
    <li class="first nowplaying odd">
    <p class="track"><span class="track_artist"><a class="first" href="/artists/florence-the-machine/">Florence And The Machine</a></span>Cosmic Love</p>
    <p class="time"><a href="/london/playlist/" onclick="s_objectID=&quot;Now_1&quot;;return this.s_oc?this.s_oc(e):true">Now</a></p>
    <p class="download"><a href="https://itunes.apple.com/gb/album/cosmic-love/id319423336?i=319423609&amp;affToken=Xfm_Miscellaneous&amp;uo=4&amp;partnerId=1006" link_type="1" onclick="s_objectID=&quot;iTunes_1&quot;;return this.s_oc?this.s_oc(e):true"><span>iTunes</span></a></p>
    </li>
    </ul>
    </div>
    </div>
    */
    function XfmScraper(name) {
        _super.call(this, name);
        this.url = "http://www.xfm.co.uk/london/";
    }
    XfmScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        this.fetchUrl(this.url, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseHtml(body, callback);
        });
    };

    XfmScraper.prototype.parseHtml = function (body, callback) {
        if (!body) {
            winston.warn("XfmScraper: No HTML body");
            return callback(null, { Artist: null, Track: null });
        }

        var $ = cheerio.load(body);

        var songElements = $('div#on_radio div.track_list li.nowplaying p.track');
        var artistElements = $('div#on_radio div.track_list li.nowplaying p.track span.track_artist');

        if (songElements.length < 1 || artistElements.length < 1) {
            winston.warn("XfmScraper: Invalid songElements or artistElements (" + songElements.length + ")/(" + artistElements.length + ")");
            return callback(null, { Artist: null, Track: null });
        }

        var songText = songElements.eq(0).text();
        var artistText = artistElements.eq(0).text();

        var artist = artistText.trim();
        var song = songText.substring(artistText.length).trim();

        if (!artist || !song) {
            winston.warn("XfmScraper: Invalid artist/song (" + artist + "/" + song + ")");
            return callback(null, { Artist: null, Track: null });
        }

        winston.info("XfmScraper found song " + artist + " - " + song);
        return callback(null, { Artist: artist, Track: song });
    };
    return XfmScraper;
})(scrap.Scraper);
exports.XfmScraper = XfmScraper;

//# sourceMappingURL=XfmScraper.js.map
