/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>
/// <reference path="../../definitions/DefinitelyTyped/underscore/underscore.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var scrap = require("./Scraper");


var _ = require("underscore");
var winston = require("winston");

var DigMusicScraper = (function (_super) {
    __extends(DigMusicScraper, _super);
    function DigMusicScraper(name, baseUrl) {
        _super.call(this, name);
        this.url = baseUrl || "http://digmusic.net.au/player-data.php";
    }
    DigMusicScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        this.fetchUrl(this.url, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseJson(body, callback);
        });
    };

    DigMusicScraper.prototype.parseJson = function (body, callback) {
        if (!body) {
            winston.warn("DigMusicScraper: No/invalid body", body);
            return callback(null, { Artist: null, Track: null });
        }

        try  {
            var json = JSON.parse(body);
        } catch (e) {
            winston.error("Could not parse JSON body", body);
            return callback("Could not parse JSON body", null);
        }

        if (!json) {
            winston.warn("DigMusicScraper: Invalid JSON", json);
            return callback(null, { Artist: null, Track: null });
        }

        var artistName, title;
        _.each(json, function (element) {
            if (element && element.playing == 'now') {
                artistName = element.artistName;
                title = element.title;
            }
        });

        if (!artistName || !title) {
            winston.info("DigMusicScraper could not find song");
            return callback(null, { Artist: null, Track: null });
        } else {
            winston.info("DigMusicScraper found song " + artistName + " - " + title);
            return callback(null, { Artist: artistName, Track: title });
        }
    };
    return DigMusicScraper;
})(scrap.Scraper);
exports.DigMusicScraper = DigMusicScraper;

//# sourceMappingURL=DigMusicScraper.js.map
