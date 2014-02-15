var scrob = require("./Scrobbler");
var scrap = require("./Scraper");

var statDao = require("./StationDao");

var interval = 1000;
var scrapers = {
    Parser1: new scrap.DummyScraper("Suffix 1"),
    Parser2: new scrap.DummyScraper("Suffix 2")
};

var scrobbler = new scrob.Scrobbler(scrapers);
var stationDao = new statDao.DummyStationDao();

setInterval(function () {
    stationDao.getStations(function (err, stations) {
        if (err)
            return;
        scrobbler.scrapeAndScrobble(stations);
    });
}, interval);

//# sourceMappingURL=main.js.map
