/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var scrap = require("./Scraper");


var winston = require("winston");

var TheEndScraper = (function (_super) {
    __extends(TheEndScraper, _super);
    function TheEndScraper(name) {
        _super.call(this, name);
        this.url = "http://kndd.tunegenie.com/w2/pluginhour/since/kndd/";
    }
    TheEndScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        var sinceTime = new Date().getTime() - (60 * 60 * 1000);
        var timestampedUrl = this.url + sinceTime + "/?x=" + new Date().getTime();
        this.fetchUrl(timestampedUrl, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseJson(body, callback);
        });
    };

    TheEndScraper.prototype.parseJson = function (body, callback) {
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
            winston.warn("TheEndScraper: Invalid json", json);
            return callback(null, { Artist: null, Track: null });
        }

        var lastTrack = json.length - 1;

        if (!json[lastTrack].artistName || !json[lastTrack].trackName) {
            winston.warn("TheEndScraper: Invalid last track", { trackName: json[lastTrack].trackName, artistName: json[lastTrack].artistName });
            return callback(null, { Artist: null, Track: null });
        }

        winston.info("TheEndScraper found song " + json[lastTrack].artistName + " - " + json[lastTrack].trackName);
        return callback(null, { Artist: json[lastTrack].artistName, Track: json[lastTrack].trackName });
    };
    return TheEndScraper;
})(scrap.Scraper);
exports.TheEndScraper = TheEndScraper;

//# sourceMappingURL=TheEndScraper.js.map
