var scrap = require("./scrapers/Scraper");
var scrob = require("./Scrobbler");

var statDao = require("./StationDao");

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
    Scraper1: new scrap.DummyScraper("Suffix 1"),
    Scraper2: new scrap.DummyScraper("Suffix 2"),
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
setInterval(function () {
    scrobbler.scrapeAndScrobble([
        { StationName: "KEXP", ScraperName: "KEXP", Session: "" },
        { StationName: "NewNormalMusic", ScraperName: "NNM", Session: "" },
        { StationName: "Triple J", ScraperName: "JJJ", Session: "" },
        { StationName: "Triple J Unearthed", ScraperName: "Unearthed", Session: "" },
        { StationName: "SomaIndiePop", ScraperName: "SomaIndiePop", Session: "" },
        { StationName: "SomaLush", ScraperName: "SomaLush", Session: "" },
        { StationName: "SomaUnderground80s", ScraperName: "SomaUnderground80s", Session: "" },
        { StationName: "HollowEarth", ScraperName: "HollowEarth", Session: "" },
        { StationName: "TheEnd", ScraperName: "TheEnd", Session: "" },
        { StationName: "C895", ScraperName: "C895", Session: "" },
        { StationName: "KCRWEclectic24", ScraperName: "KCRWEclectic24", Session: "" },
        { StationName: "KCQN", ScraperName: "KCQN", Session: "" },
        { StationName: "Gold", ScraperName: "Gold", Session: "" },
        { StationName: "WFMU", ScraperName: "WFMU", Session: "" },
        { StationName: "KCRW", ScraperName: "KCRW", Session: "" },
        { StationName: "XFM", ScraperName: "XFM", Session: "" },
        { StationName: "PunkFM", ScraperName: "PunkFM", Session: "" },
        { StationName: "Andys80s", ScraperName: "Andys80s", Session: "" },
        { StationName: "WFUV", ScraperName: "WFUV", Session: "" },
        { StationName: "FUVAllMusic", ScraperName: "FUVAllMusic", Session: "" },
        { StationName: "AlternateSide", ScraperName: "AlternateSide", Session: "" },
        { StationName: "DigMusic", ScraperName: "DigMusic", Session: "" },
        { StationName: "WZBC", ScraperName: "WZBC", Session: "" },
        { StationName: "PlayFM", ScraperName: "PlayFM", Session: "" },
        { StationName: "ABCJazz", ScraperName: "ABCJazz", Session: "" },
        { StationName: "TheCurrent", ScraperName: "TheCurrent", Session: "" }
    ]);
}, interval);

//# sourceMappingURL=main.js.map
