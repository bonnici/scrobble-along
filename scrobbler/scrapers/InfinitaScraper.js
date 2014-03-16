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

var InfinitaScraper = (function (_super) {
    __extends(InfinitaScraper, _super);
    function InfinitaScraper(name) {
        _super.call(this, name);
        this.url = "http://www.infinita.cl/datas/ahora.xml";
    }
    InfinitaScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        this.fetchUrl(this.url, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseHtml(body, callback);
        });
    };

    InfinitaScraper.prototype.parseHtml = function (body, callback) {
        if (!body) {
            winston.warn("InfinitaScraper: No HTML body");
            callback(null, { Artist: null, Track: null });
            return;
        }

        var $ = cheerio.load(body);

        var artistData = $('interprete').text();
        var songData = $('nombre').text();

        if (!artistData || !songData) {
            callback(null, { Artist: null, Track: null });
            return;
        }

        var artistName = artistData.trim();
        var songName = songData.trim();

        if (!artistName || !songName) {
            callback(null, { Artist: null, Track: null });
        } else {
            callback(null, { Artist: artistName, Track: songName });
        }
    };
    return InfinitaScraper;
})(scrap.Scraper);
exports.InfinitaScraper = InfinitaScraper;

//# sourceMappingURL=InfinitaScraper.js.map
