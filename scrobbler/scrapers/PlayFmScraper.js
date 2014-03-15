/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var scrap = require("./Scraper");


var winston = require("winston");

var PlayFmScraper = (function (_super) {
    __extends(PlayFmScraper, _super);
    function PlayFmScraper(name) {
        _super.call(this, name);
        this.url = "http://nowplaying.playfm.cl/api/station/4f47e1a2ee909d6c7b0001db/nowplaying";
    }
    PlayFmScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        this.fetchUrl(this.url, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseJson(body, callback);
        });
    };

    PlayFmScraper.prototype.parseJson = function (body, callback) {
        if (!body) {
            winston.warn("PlayFmScraper: No/invalid body", body);
            return callback(null, { Artist: null, Track: null });
        }

        try  {
            var json = JSON.parse(body);
        } catch (e) {
            winston.error("Could not parse JSON body", body);
            return callback("Could not parse JSON body", null);
        }

        if (!json || !json.data) {
            winston.warn("PlayFmScraper: Invalid JSON", json);
            return callback(null, { Artist: null, Track: null });
        }

        if (!json.data.artist || !json.data.artist.name || !json.data.song || !json.data.song.title) {
            winston.info("PlayFmScraper could not find song");
            return callback(null, { Artist: null, Track: null });
        }

        winston.info("PlayFmScraper found song " + json.data.artist.name + " - " + json.data.song.title);
        return callback(null, { Artist: json.data.artist.name, Track: json.data.song.title });
    };
    return PlayFmScraper;
})(scrap.Scraper);
exports.PlayFmScraper = PlayFmScraper;

//# sourceMappingURL=PlayFmScraper.js.map
