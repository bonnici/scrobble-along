/// <reference path="../definitions/DefinitelyTyped/mongodb/mongodb.d.ts"/>
/// <reference path="../definitions/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../definitions/dummy-definitions/lastfm.d.ts"/>
/// <reference path="../definitions/typescript-node-definitions/winston.d.ts"/>

import _ = require("underscore");
import lastfm = require("lastfm");
import mongodb = require("mongodb");
import winston = require("winston");

import crypt = require("./Crypter");
import scrap = require("./scrapers/Scraper");
import scrob = require("./Scrobbler");
import stat = require("./Station");
import statDao = require("./StationDao");
import lfmDao = require("./LastFmDao");
import usr = require("./User");
import usrDao = require("./UserDao");

import kexp = require("./scrapers/KexpScraper");
import nnm = require("./scrapers/NnmScraper");
import jjj = require("./scrapers/JjjScraper");
import soma = require("./scrapers/SomaScraper");
import hollow = require("./scrapers/HollowEarthScraper");
import theEnd = require("./scrapers/TheEndScraper");
import c895 = require("./scrapers/C895Scraper");
import kcrwEclectic24 = require("./scrapers/KcrwEclectic24Scraper");
import kcqn = require("./scrapers/KcqnScraper");
import goldRadio = require("./scrapers/GoldRadioScraper");
import wfmu = require("./scrapers/WfmuScraper");
import kcrw = require("./scrapers/KcrwScraper");
import xfm = require("./scrapers/XfmScraper");
import punkFm = require("./scrapers/PunkFmScraper");
import andys80s = require("./scrapers/Andys80sScraper");
import wfuv = require("./scrapers/WfuvScraper");
import digMusic = require("./scrapers/DigMusicScraper");
import wzbc = require("./scrapers/WzbcScraper");
import playFm = require("./scrapers/PlayFmScraper");
import theCurrent = require("./scrapers/TheCurrentScraper");

// Required environment variables
var CRYPTO_KEY = process.env.CRYPTO_KEY;
var MONGO_URI = process.env.MONGO_URI;
var LASTFM_API_KEY = process.env.LASTFM_API_KEY;
var LASTFM_SECRET = process.env.LASTFM_SECRET;

if (!CRYPTO_KEY || !MONGO_URI || !LASTFM_API_KEY || !LASTFM_SECRET) {
	winston.err("A required environment variable is missing:", process.env);
	process.exit(1);
}

var interval = 15000; // 15 seconds
var scrapers:{ [index: string]: scrap.Scraper; } = {
	/*None: null,*/
	KEXP: new kexp.KexpScraper("KEXP"),
	NNM: new nnm.NnmScraper("NNM"),
	JJJ: new jjj.JjjScraper("JJJ"),
	Unearthed: new jjj.JjjScraper("Unearthed", "http://www.abc.net.au/triplej/feeds/playout/unearthed_playout.xml"),
	SomaIndiePop: new soma.SomaScraper("SomaIndiePop", "indiepop"),
	SomaLush: new soma.SomaScraper("SomaLush", "lush"),
	SomaUnderground80s: new soma.SomaScraper("SomaUnderground80s", "u80s"),
	HollowEarth: new hollow.HollowEarthScraper("HollowEarth"),
	TheEnd: new theEnd.TheEndScraper("TheEnd"),
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
	TheCurrent: new theCurrent.TheCurrentScraper("TheCurrent")
};

//////////////
// Proper scrobbler
//////////////

var lastfmNode = new lastfm.LastFmNode({
	api_key: LASTFM_API_KEY,
	secret: LASTFM_SECRET,
	useragent: 'todo: get from DB'
});
var lastFmDao = new lfmDao.LastFmDaoImpl(lastfmNode);
var scrobbler = new scrob.Scrobbler(lastFmDao);

mongodb.connect(MONGO_URI, (err, dbClient) => {
	if (err) {
		winston.err("Error connecting to MongoDB:", err);
		process.exit(1);
	}

	var crypter = new crypt.CrypterImpl(CRYPTO_KEY);
	var stationDao = new statDao.MongoStationDao(dbClient, crypter);
	var userDao = new usrDao.MongoUserDao(dbClient, crypter);

	setInterval(
		() => {
			stationDao.getStations((err, stations: stat.Station[]) => {
				if (err) return; // Assume error logging is done by DAO

				_.each(stations, (station:stat.Station) => {
					if (!station) return; // break //todo test that this actually does break

					userDao.getUsersListeningToStation(station.StationName, (err, users:usr.User[]) => {
						if (err) return; // break //todo test that this actually does break
						scrobbler.scrapeAndScrobble(scrapers[station.ScraperName], station, users);
					});
				});
			});
		}
	, interval);
});


//////////////
// Scrobbler that scrapes but does not scrobble or load proper users/stations
//////////////
/*
var stationDao = new statDao.DummyStationDao();
var userDao = new usrDao.DummyUserDao();
var lastFmDao = new lfmDao.DummyLastFmDao();
var scrobbler = new scrob.Scrobbler(lastFmDao);

setInterval(
	() => {
		stationDao.getStations((err, stations: stat.Station[]) => {
			if (err) return; // Assume error logging is done by DAO

			_.each(stations, (station:stat.Station) => {
				if (!station) return; // break //todo test that this actually does break

				userDao.getUsersListeningToStation(station.StationName, (err, users:usr.User[]) => {
					if (err) return; // break //todo test that this actually does break
					scrobbler.scrapeAndScrobble(scrapers[station.ScraperName], station, users);
				});
			});
		});
	}
, interval);
*/

//////////////
// Scrobbler that scrapes but does not scrobble and uses fake stations & users
//////////////
/*
var stations = [
	{ StationName: "KEXP903FM", ScraperName: "KEXP", Session: "KEXP903FMSession" },
	{ StationName: "NNM", ScraperName: "NNM", Session: "NNMSession" },
	{ StationName: "triplejradio", ScraperName: "JJJ", Session: "triplejradioSession" },
	{ StationName: "Unearthed", ScraperName: "Unearthed", Session: "UnearthedSession" },
	{ StationName: "SomaIndiePop", ScraperName: "SomaIndiePop", Session: "SomaIndiePopSession" },
	{ StationName: "SomaLush", ScraperName: "SomaLush", Session: "SomaLushSession" },
	{ StationName: "SomaUnderground80s", ScraperName: "SomaUnderground80s", Session: "SomaUnderground80sSession" },
	{ StationName: "HollowEarth", ScraperName: "HollowEarth", Session: "HollowEarthSession" },
	{ StationName: "TheEnd", ScraperName: "TheEnd", Session: "TheEndSession" },
	{ StationName: "C895", ScraperName: "C895", Session: "C895Session" },
	{ StationName: "KCRWEclectic24", ScraperName: "KCRWEclectic24", Session: "KCRWEclectic24Session" },
	{ StationName: "KCQN", ScraperName: "KCQN", Session: "KCQNSession" },
	{ StationName: "Gold", ScraperName: "Gold", Session: "GoldSession" },
	{ StationName: "WFMU", ScraperName: "WFMU", Session: "WFMUSession" },
	{ StationName: "KCRW", ScraperName: "KCRW", Session: "KCRWSession" },
	{ StationName: "XFM", ScraperName: "XFM", Session: "XFMSession" },
	{ StationName: "PunkFM", ScraperName: "PunkFM", Session: "PunkFMSession" },
	{ StationName: "Andys80s", ScraperName: "Andys80s", Session: "Andys80sSession" },
	{ StationName: "WFUV", ScraperName: "WFUV", Session: "WFUVSession" },
	{ StationName: "FUVAllMusic", ScraperName: "FUVAllMusic", Session: "FUVAllMusicSession" },
	{ StationName: "AlternateSide", ScraperName: "AlternateSide", Session: "AlternateSideSession" },
	{ StationName: "DigMusic", ScraperName: "DigMusic", Session: "DigMusicSession" },
	{ StationName: "WZBC", ScraperName: "WZBC", Session: "WZBCSession" },
	{ StationName: "PlayFM", ScraperName: "PlayFM", Session: "PlayFMSession" },
	{ StationName: "ABCJazz", ScraperName: "ABCJazz", Session: "ABCJazzSession" },
	{ StationName: "TheCurrent", ScraperName: "TheCurrent", Session: "TheCurrentSession" },
	null
];

var usersListening = {
	KEXP903FM: [{ UserName: "KEXPListener1", Session: "KEXPListener1Session" },
				{ UserName: "KEXPListener2", Session: "KEXPListener2Session" }],
	NNM: [{ UserName: "KEXPListener1", Session: "KEXPListener1Session" }],
	triplejradio: [{ UserName: "JJJListener1", Session: "JJJListener1Session" }, null],
	TheEnd: null,
	TheCurrent: []
};

var lastFmDao = new lfmDao.DummyLastFmDao();
var scrobbler = new scrob.Scrobbler(lastFmDao);

setInterval(() => { testScrapeAndScrobble(); }, interval);
testScrapeAndScrobble();

function testScrapeAndScrobble() {
	_.each(stations, (station:stat.Station) => {
		if (station) {
			scrobbler.scrapeAndScrobble(scrapers[station.ScraperName], station, usersListening[station.StationName]);
		}
	});
};
*/