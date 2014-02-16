var scrob = require("./Scrobbler");
var scrap = require("./Scraper");
var kexp = require("./scrapers/KexpScraper");

var statDao = require("./StationDao");

var interval = 5000;
var scrapers = {
    Parser1: new scrap.DummyScraper("Suffix 1"),
    Parser2: new scrap.DummyScraper("Suffix 2"),
    KEXP: new kexp.KexpScraper()
};

var scrobbler = new scrob.Scrobbler(scrapers);
var stationDao = new statDao.DummyStationDao();

/*
setInterval(
() => {
stationDao.getStations((err, stations: stat.Station[]) => {
if (err) return; // Assume error logging is done by DAO
scrobbler.scrapeAndScrobble(stations);
});

}
, interval);
*/
scrobbler.scrapeAndScrobble([{ StationName: "KEXP", ParserName: "KEXP", Session: "" }]);

//# sourceMappingURL=main.js.map
