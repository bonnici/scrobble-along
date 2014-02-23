

var DummyStationDao = (function () {
    function DummyStationDao() {
    }
    DummyStationDao.prototype.getStations = function (callback) {
        return callback(null, [
            { ScraperName: "Scraper1", Session: "" },
            { ScraperName: "Scraper2", Session: "" },
            { ScraperName: "Scraper1", Session: "" }
        ]);
    };
    return DummyStationDao;
})();
exports.DummyStationDao = DummyStationDao;

//# sourceMappingURL=StationDao.js.map
