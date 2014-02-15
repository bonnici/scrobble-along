

var DummyStationDao = (function () {
    function DummyStationDao() {
    }
    DummyStationDao.prototype.getStations = function (callback) {
        return callback(null, [
            { StationName: "Station 1", ParserName: "Parser1", Session: "" },
            { StationName: "Station 2", ParserName: "Parser2", Session: "" },
            { StationName: "Station 3", ParserName: "Parser1", Session: "" }
        ]);
    };
    return DummyStationDao;
})();
exports.DummyStationDao = DummyStationDao;

//# sourceMappingURL=StationDao.js.map
