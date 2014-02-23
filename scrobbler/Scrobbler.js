


//import _ = require("underscore");
/*
interface ScrobblerStationData {
nowPlayingSong: song.Song;
nowPlayingStarted: number; // timestamp
};
*/
var Scrobbler = (function () {
    // keep map of station -> { nowPlaying (Song), nowPlayingStart (moment), lastScrobble (Song), lastScrobbleStart (moment), consecutiveUpdateErrors (number), nowPlayingLastPosted (moment) }
    // put this in an interface called ScrobblerStationData
    //private stationData:{ [index: string]: ScrobblerStationData; }
    function Scrobbler(scrapers) {
        this.scrapers = scrapers;
    }
    Scrobbler.prototype.scrapeAndScrobble = function (stations) {
        for (var i = 0; i < stations.length; i++) {
            var scraperName = stations[i].ScraperName;
            var scraper = this.scrapers[scraperName];

            scraper.fetchAndParse(function (err, song) {
                if (!err) {
                    if (song) {
                        console.log("Scraped song " + song.Artist + " - " + song.Track);
                    } else {
                        console.log("Could not scrape song");
                    }
                }
            });
            /*
            if (!scraper) {
            // log
            continue;
            }
            
            var stationData = this.stationData[scraperName];
            if (!stationData) {
            stationData = {..};
            this.stationData[scraperName] = stationData;
            }
            
            (scraperName) => {
            scraper.fetchAndParse((err, song) => {
            // [Make sure errors only happen in rare & unexpected circumstances (e.g. 404 rather than song not found)
            
            if (err) {
            continue
            winston.error("Error scraping " + scraperName)
            }
            // if station was last updated a long time ago, clear the data for the station
            // update station last processed time to now
            
            // if song is different to previous song
            // scrobble previous song if it's valid and its start time was long enough ago
            // update now playing song to current song and now playing start to now
            // if the new now playing song is valid, post now playing
            
            // [just need to store now playing song and when it started for each station]
            
            });
            }(scraperName);
            */
        }
    };
    return Scrobbler;
})();
exports.Scrobbler = Scrobbler;

//# sourceMappingURL=Scrobbler.js.map
