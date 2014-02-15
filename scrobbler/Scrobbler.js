


//import _ = require("underscore");
var Scrobbler = (function () {
    function Scrobbler(scrapers) {
    }
    Scrobbler.prototype.scrapeAndScrobble = function (stations) {
        for (var i = 0; i < stations.length; i++) {
            console.log(stations[i].StationName + " " + stations[i].ParserName);
        }
    };
    return Scrobbler;
})();
exports.Scrobbler = Scrobbler;

//# sourceMappingURL=Scrobbler.js.map
