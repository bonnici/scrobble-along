/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var scrap = require("./Scraper");

var winston = require("winston");

/*
Base class for scrapers that get JSON data. Other JSON scrapers should be migrated to this eventually.
To use, set this.url in the constructor after calling super and implement extractSong.
*/
var JsonScraper = (function (_super) {
    __extends(JsonScraper, _super);
    function JsonScraper(name) {
        _super.call(this, name);
    }
    JsonScraper.prototype.fetchAndParse = function (callback) {
        var _this = this;
        this.fetchUrl(this.url, function (err, body) {
            if (err)
                return callback(err, null);

            if (!body) {
                winston.warn("JsonScraper: No/invalid body", body);
                callback(null, { Artist: null, Track: null });
                return;
            }

            try  {
                var json = JSON.parse(body);
            } catch (e) {
                winston.error("Could not parse JSON body", body);
                callback("Could not parse JSON body", null);
                return;
            }

            try  {
                var curSong = _this.extractSong(json);
                callback(null, curSong);
                return;
            } catch (err) {
                winston.warn("JsonScraper: Invalid JSON", json);
            }

            callback(null, { Artist: null, Track: null });
        });
    };

    JsonScraper.prototype.extractSong = function (jsonData) {
        throw "Abstract function";
    };
    return JsonScraper;
})(scrap.Scraper);
exports.JsonScraper = JsonScraper;

//# sourceMappingURL=JsonScraper.js.map
