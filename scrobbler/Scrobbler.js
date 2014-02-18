


//import _ = require("underscore");
var Scrobbler = (function () {
    function Scrobbler(scrapers) {
        this.scrapers = scrapers;
    }
    Scrobbler.prototype.scrapeAndScrobble = function (stations) {
        for (var i = 0; i < stations.length; i++) {
            //console.log(stations[i].StationName + " " + stations[i].ScraperName);
            var scraper = this.scrapers[stations[i].ScraperName];
            if (scraper) {
                scraper.fetchAndParse(function (err, song) {
                    if (!err) {
                        if (song) {
                            console.log("Scraped song " + song.Artist + " - " + song.Track);
                        } else {
                            console.log("Could not scrape song");
                        }
                    }
                    // Assume error logging is done by scraper
                });
            } else {
                //todo log
            }
        }
    };
    return Scrobbler;
})();
exports.Scrobbler = Scrobbler;

//# sourceMappingURL=Scrobbler.js.map
