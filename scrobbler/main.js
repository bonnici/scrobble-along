/// <reference path="../definitions/DefinitelyTyped/mongodb/mongodb.d.ts"/>
/// <reference path="../definitions/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../definitions/dummy-definitions/lastfm.d.ts"/>
/// <reference path="../definitions/typescript-node-definitions/winston.d.ts"/>
var _ = require("underscore");
var lastfm = require("lastfm");
var mongodb = require("mongodb");
var winston = require("winston");

var crypt = require("./Crypter");

var scrob = require("./Scrobbler");

var statDao = require("./StationDao");
var lfmDao = require("./LastFmDao");

var usrDao = require("./UserDao");

var kexp = require("./scrapers/KexpScraper");
var nnm = require("./scrapers/NnmScraper");
var jjj = require("./scrapers/JjjScraper");
var soma = require("./scrapers/SomaScraper");
var hollow = require("./scrapers/HollowEarthScraper");
var theEnd = require("./scrapers/TheEndHtmlScraper");
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
var lfmScraper = require("./scrapers/LastfmScraper");
var lfmNoNowPlayingScraper = require("./scrapers/LastfmNoNowPlayingScraper");
var infinita = require("./scrapers/InfinitaScraper");
var mediaStream = require("./scrapers/MediaStreamScraper");
var newtown = require("./scrapers/NewtownRadioScraper");
var radio2Nl = require("./scrapers/Radio2NLScraper");
var kloveAir1 = require("./scrapers/KLoveAir1RadioScraper");

// Required environment variables
var STATION_CRYPTO_KEY = process.env.SA_STATION_CRYPTO_KEY;
var USER_CRYPTO_KEY = process.env.SA_USER_CRYPTO_KEY;
var MONGO_URI = process.env.SA_MONGO_URI;
var LASTFM_API_KEY = process.env.SA_LASTFM_API_KEY;
var LASTFM_SECRET = process.env.SA_LASTFM_SECRET;
var SHOULD_SCROBBLE = process.env.SA_SHOULD_SCROBBLE;

if (!STATION_CRYPTO_KEY || !USER_CRYPTO_KEY || !MONGO_URI || !LASTFM_API_KEY || !LASTFM_SECRET || !SHOULD_SCROBBLE) {
    winston.error("A required environment variable is missing:", process.env);
    process.exit(1);
}

var interval = 15000;
var scrapers = {
    KEXP: new kexp.KexpScraper("KEXP"),
    NNM: new nnm.NnmScraper("NNM"),
    JJJ: new jjj.JjjScraper("JJJ"),
    Unearthed: new jjj.JjjScraper("Unearthed", "http://www.abc.net.au/triplej/feeds/playout/unearthed_playout.xml"),
    SomaIndiePop: new soma.SomaScraper("SomaIndiePop", "indiepop"),
    SomaLush: new soma.SomaScraper("SomaLush", "lush"),
    SomaUnderground80s: new soma.SomaScraper("SomaUnderground80s", "u80s"),
    HollowEarth: new hollow.HollowEarthScraper("HollowEarth"),
    TheEnd: new theEnd.TheEndHtmlScraper("TheEnd"),
    C895: new c895.C895Scraper("C895"),
    KCRWEclectic24: new kcrwEclectic24.KcrwEclectic24Scraper("KCRWEclectic24"),
    KCQN: new kcqn.KcqnScraper("KCQN"),
    Gold: new goldRadio.GoldRadioScraper("Gold"),
    WFMU: new wfmu.WfmuScraper("WFMU"),
    KCRW: new kcrw.KcrwScraper("KCRW"),
    XFM: new xfm.XfmScraper("XFM"),
    PunkFM: new punkFm.PunkFmScraper("PunkFM"),
    Andys80s: new andys80s.Andys80sScraper("Andys80s"),
    WFUV: new wfuv.WfuvScraper("WFUV", "wfuv"),
    FUVAllMusic: new wfuv.WfuvScraper("FUVAllMusic", "hd2"),
    AlternateSide: new wfuv.WfuvScraper("AlternateSide", "hd3"),
    DigMusic: new digMusic.DigMusicScraper("DigMusic"),
    WZBC: new wzbc.WzbcScraper("WZBC"),
    PlayFM: new playFm.PlayFmScraper("PlayFM"),
    ABCJazz: new digMusic.DigMusicScraper("ABCJazz", "http://abcjazz.net.au/player-data.php"),
    TheCurrent: new theCurrent.TheCurrentScraper("TheCurrent"),
    LastFM: new lfmScraper.LastfmScraper("LastFM", LASTFM_API_KEY),
    LastFMIgnoreListening: new lfmNoNowPlayingScraper.LastfmNoNowPlayingScraper("LastFMIgnoreListening", LASTFM_API_KEY),
    Infinita: new infinita.InfinitaScraper("Infinita"),
    Oasis: new mediaStream.MediaStreamScraper("Oasis", "5124ed51ed596bde7d000016"),
    Horizonte: new mediaStream.MediaStreamScraper("Horizonte", "5124f1b4ed596bde7d000017"),
    NewtownRadio: new newtown.NewtownRadioScraper("NewtownRadio"),
    Radio2NL: new radio2Nl.Radio2NLScraper("Radio2NL"),
    Air1: new kloveAir1.KLoveAir1RadioScraper("Air1", "2"),
    KLove: new kloveAir1.KLoveAir1RadioScraper("KLove", "1")
};

//////////////
// Proper scrobbler
//////////////
var lastfmNode = new lastfm.LastFmNode({
    api_key: LASTFM_API_KEY,
    secret: LASTFM_SECRET,
    useragent: 'scrobblealong/v0.0.1 ScrobbleAlong'
});

var lastFmDao = SHOULD_SCROBBLE == "true" ? new lfmDao.LastFmDaoImpl(lastfmNode) : new lfmDao.DummyLastFmDao();

var scrobbler = new scrob.Scrobbler(lastFmDao);

function scrapeAndScrobbleAllStations(stationDao, userDao) {
    stationDao.getStations(function (err, stations) {
        if (err)
            return;

        _.each(stations, function (station) {
            if (!station)
                return;

            if (station.Disabled) {
                winston.info("Station " + station.StationName + " is disabled and was skipped");
                return;
            }

            userDao.getUsersListeningToStation(station.StationName, function (err, users) {
                if (err)
                    return;
                scrobbler.scrapeAndScrobble(scrapers[station.ScraperName], station, users);
            });
        });
    });
}
;

mongodb.connect(MONGO_URI, function (err, dbClient) {
    if (err) {
        winston.err("Error connecting to MongoDB:", err);
        process.exit(1);
    }

    var stationDao = new statDao.MongoStationDao(dbClient, new crypt.CrypterImpl(STATION_CRYPTO_KEY));
    var userDao = new usrDao.MongoUserDao(dbClient, new crypt.CrypterImpl(USER_CRYPTO_KEY));

    setInterval(function () {
        scrapeAndScrobbleAllStations(stationDao, userDao);
    }, interval);
    scrapeAndScrobbleAllStations(stationDao, userDao);
});

//# sourceMappingURL=main.js.map
