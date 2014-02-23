
var scrob = require("./Scrobbler");

var statDao = require("./StationDao");
var lfmDao = require("./LastFmDao");

var kexp = require("./scrapers/KexpScraper");
var nnm = require("./scrapers/NnmScraper");
var jjj = require("./scrapers/JjjScraper");
var soma = require("./scrapers/SomaScraper");
var hollow = require("./scrapers/HollowEarthScraper");
var theEnd = require("./scrapers/TheEndScraper");
var c895 = require("./scrapers/C895Scraper");
var kcrwEclectic24 = require("./scrapers/KcrwEclectic24Scraper");
var kcqn = require("./scrapers/KcqnScraper");
var goldRadio = require("./scrapers/GoldRadioScraper");
var wfmu = require("./scrapers/WfmuScraper");
var kcrw = require("./scrapers/KcrwScraper");
var xfm = require("./scrapers/XfmScraper");
var punkFm = require("./scrapers/PunkFmScraper");
var andys80s = require("./scrapers/Andys80sScraper");
var wfuv = require("./scrapers/WfuvScraper");
var digMusic = require("./scrapers/DigMusicScraper");
var wzbc = require("./scrapers/WzbcScraper");
var playFm = require("./scrapers/PlayFmScraper");
var theCurrent = require("./scrapers/TheCurrentScraper");

var interval = 15000;
var scrapers = {
    None: null,
    KEXP: new kexp.KexpScraper(),
    NNM: new nnm.NnmScraper(),
    JJJ: new jjj.JjjScraper(),
    Unearthed: new jjj.JjjScraper("http://www.abc.net.au/triplej/feeds/playout/unearthed_playout.xml"),
    SomaIndiePop: new soma.SomaScraper("indiepop"),
    SomaLush: new soma.SomaScraper("lush"),
    SomaUnderground80s: new soma.SomaScraper("u80s"),
    HollowEarth: new hollow.HollowEarthScraper(),
    TheEnd: new theEnd.TheEndScraper(),
    C895: new c895.C895Scraper(),
    KCRWEclectic24: new kcrwEclectic24.KcrwEclectic24Scraper(),
    KCQN: new kcqn.KcqnScraper(),
    Gold: new goldRadio.GoldRadioScraper(),
    WFMU: new wfmu.WfmuScraper(),
    KCRW: new kcrw.KcrwScraper(),
    XFM: new xfm.XfmScraper(),
    PunkFM: new punkFm.PunkFmScraper(),
    Andys80s: new andys80s.Andys80sScraper(),
    WFUV: new wfuv.WfuvScraper("wfuv"),
    FUVAllMusic: new wfuv.WfuvScraper("hd2"),
    AlternateSide: new wfuv.WfuvScraper("hd3"),
    DigMusic: new digMusic.DigMusicScraper(),
    WZBC: new wzbc.WzbcScraper(),
    PlayFM: new playFm.PlayFmScraper(),
    ABCJazz: new digMusic.DigMusicScraper("http://abcjazz.net.au/player-data.php"),
    TheCurrent: new theCurrent.TheCurrentScraper()
};

var stationDao = new statDao.DummyStationDao();
var lastFmDao = new lfmDao.DummyLastFmDao();
var scrobbler = new scrob.Scrobbler(scrapers, lastFmDao);

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
var stations = [
    { ScraperName: "KEXP", Session: "" },
    { ScraperName: "NNM", Session: "" },
    { ScraperName: "JJJ", Session: "" },
    { ScraperName: "Unearthed", Session: "" },
    { ScraperName: "SomaIndiePop", Session: "" },
    { ScraperName: "SomaLush", Session: "" },
    { ScraperName: "SomaUnderground80s", Session: "" },
    { ScraperName: "HollowEarth", Session: "" },
    { ScraperName: "TheEnd", Session: "" },
    { ScraperName: "C895", Session: "" },
    { ScraperName: "KCRWEclectic24", Session: "" },
    { ScraperName: "KCQN", Session: "" },
    { ScraperName: "Gold", Session: "" },
    { ScraperName: "WFMU", Session: "" },
    { ScraperName: "KCRW", Session: "" },
    { ScraperName: "XFM", Session: "" },
    { ScraperName: "PunkFM", Session: "" },
    { ScraperName: "Andys80s", Session: "" },
    { ScraperName: "WFUV", Session: "" },
    { ScraperName: "FUVAllMusic", Session: "" },
    { ScraperName: "AlternateSide", Session: "" },
    { ScraperName: "DigMusic", Session: "" },
    { ScraperName: "WZBC", Session: "" },
    { ScraperName: "PlayFM", Session: "" },
    { ScraperName: "ABCJazz", Session: "" },
    { ScraperName: "TheCurrent", Session: "" }
];

/*
setInterval(
() => {
scrobbler.scrapeAndScrobble(stations);
} , interval);
*/
scrobbler.scrapeAndScrobble(stations);

//# sourceMappingURL=main.js.map
