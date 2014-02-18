

var DummyStationDao = (function () {
    function DummyStationDao() {
    }
    DummyStationDao.prototype.getStations = function (callback) {
        return callback(null, [
            { StationName: "Station 1", ScraperName: "Scraper1", Session: "" },
            { StationName: "Station 2", ScraperName: "Scraper2", Session: "" },
            { StationName: "Station 3", ScraperName: "Scraper1", Session: "" }
        ]);
    };
    return DummyStationDao;
})();
exports.DummyStationDao = DummyStationDao;

//# sourceMappingURL=StationDao.js.map
