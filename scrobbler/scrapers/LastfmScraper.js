/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var jsonScrap = require("./JsonScraper");

var winston = require("winston");

var LastfmScraper = (function (_super) {
    __extends(LastfmScraper, _super);
    function LastfmScraper(name, username, apiKey, ignoreListening) {
        _super.call(this, name);
        this.ignoreListening = ignoreListening;
        this.url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=" + username + "&api_key=" + apiKey + "&limit=1&format=json";
    }
    LastfmScraper.prototype.extractSong = function (jsonData) {
        try  {
            var track = jsonData['recenttracks']['track'];

            if (!track["artist"]) {
                track = track[0];
            }

            if (this.ignoreListening || track["@attr"] && track["@attr"]["nowplaying"] == "true") {
                return { Artist: track['artist']['#text'], Track: track['name'] };
            }
        } catch (err) {
            winston.warn("LastfmScraper: Invalid JSON", jsonData);
        }

        return { Artist: null, Track: null };
    };
    return LastfmScraper;
})(jsonScrap.JsonScraper);
exports.LastfmScraper = LastfmScraper;

//# sourceMappingURL=LastfmScraper.js.map
