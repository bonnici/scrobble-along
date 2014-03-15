/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var scrap = require("./Scraper");


var winston = require("winston");

var KcrwEclectic24Scraper = (function (_super) {
    __extends(KcrwEclectic24Scraper, _super);
    function KcrwEclectic24Scraper(name) {
        _super.call(this, name);
        this.url = "http://www.kcrw.com/json_song";
    }
    KcrwEclectic24Scraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        this.fetchUrl(this.url, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseJson(body, callback);
        });
    };

    KcrwEclectic24Scraper.prototype.parseJson = function (body, callback) {
        if (!body) {
            return callback(null, { Artist: null, Track: null });
        }

        try  {
            var json = JSON.parse(body);
        } catch (e) {
            winston.error("Could not parse JSON body", body);
            return callback("Could not parse JSON body", null);
        }

        if (!json || json.length == 0) {
            winston.warn("KCRWEclectic24Scraper: Invalid json", json);
            return callback(null, { Artist: null, Track: null });
        }

        if (!json.artist || !json.title) {
            winston.warn("KCRWEclectic24Scraper: Invalid track", { title: json.title, artist: json.artist });
            return callback(null, { Artist: null, Track: null });
        }

        winston.info("KCRWEclectic24Scraper found song " + json.artist + " - " + json.title);
        return callback(null, { Artist: json.artist, Track: json.title });
    };
    return KcrwEclectic24Scraper;
})(scrap.Scraper);
exports.KcrwEclectic24Scraper = KcrwEclectic24Scraper;

//# sourceMappingURL=KcrwEclectic24Scraper.js.map
