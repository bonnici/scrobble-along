var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};


// Abstract base class
var Scraper = (function () {
    function Scraper() {
    }
    // Should call success with a song if it was found, success with null artist/track if no song was found,
    // failure if there was a recoverable error fetching or parsing
    Scraper.prototype.fetchAndParse = function (callback) {
        throw new Error("Abstract");
    };

    // protected
    Scraper.prototype.fetchUrl = function (fullUrl, callback) {
        return this.fetchUrlWithHeaders(fullUrl, {}, callback);
    };

    // protected
    Scraper.prototype.fetchUrlWithHeaders = function (fullUrl, headers, callback) {
        //todo
        return callback(null, "body");
        //winston.info("Fetching URL", fullUrl);
        //winston.info("With headers", headers);
        /*
        request({ url: fullUrl, headers: headers }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
        return success(body);
        }
        
        if (error) {
        winston.error("Error requesting URL " + fullUrl, error);
        return failure("Error during request");
        }
        else {
        return failure("Bad status code (" + response.statusCode + ") fetching URL " + fullUrl);
        }
        
        });
        */
    };
    return Scraper;
})();
exports.Scraper = Scraper;

var DummyScraper = (function (_super) {
    __extends(DummyScraper, _super);
    function DummyScraper(suffix) {
        _super.call(this);
        this.suffix = suffix;
    }
    DummyScraper.prototype.fetchAndParse = function (callback) {
        var songs = [
            { Artist: "Artist 1 " + this.suffix, Track: "Track 1 " + this.suffix },
            { Artist: "Artist 2 " + this.suffix, Track: "Track 3 " + this.suffix },
            { Artist: "Artist 3 " + this.suffix, Track: "Track 3 " + this.suffix }
        ];
        return callback(null, songs[Math.random() * songs.length]);
    };
    return DummyScraper;
})(Scraper);
exports.DummyScraper = DummyScraper;

//# sourceMappingURL=Scraper.js.map
