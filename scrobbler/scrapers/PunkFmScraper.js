/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var scrap = require("./Scraper");


var winston = require("winston");

var PunkFmScraper = (function (_super) {
    __extends(PunkFmScraper, _super);
    function PunkFmScraper(name) {
        _super.call(this, name);
        this.url = "http://centovacast.galaxywebsolutions.com/external/rpc.php?m=streaminfo.get&username=punkfm&charset=&mountpoint=&rid=punkfm&_=";
    }
    PunkFmScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        var timestampedUrl = this.url + new Date().getTime();
        this.fetchUrl(timestampedUrl, function (err, body) {
            if (err)
                return callback(err, null);
            return _this.parseJson(body, callback);
        });
    };

    PunkFmScraper.prototype.parseJson = function (body, callback) {
        if (!body) {
            return callback(null, { Artist: null, Track: null });
        }

        try  {
            var json = JSON.parse(body);
        } catch (e) {
            winston.error("PunkFmScraper: Could not parse JSON body", body);
            return callback("Could not parse JSON body", null);
        }

        if (!json) {
            winston.warn("PunkFmScraper: Invalid json", json);
            return callback(null, { Artist: null, Track: null });
        }

        if (!json.data || json.data.length < 1 || !json.data[0].track || !json.data[0].track.artist || !json.data[0].track.title) {
            winston.warn("PunkFmScraper: Invalid json", json);
            return callback(null, { Artist: null, Track: null });
        }

        winston.info("PunkFmScraper found song " + json.data[0].track.artist + " - " + json.data[0].track.title);
        return callback(null, { Artist: json.data[0].track.artist, Track: json.data[0].track.title });
    };
    return PunkFmScraper;
})(scrap.Scraper);
exports.PunkFmScraper = PunkFmScraper;

//# sourceMappingURL=PunkFmScraper.js.map
