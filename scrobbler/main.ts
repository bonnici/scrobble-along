/// <reference path="../definitions/DefinitelyTyped/mongodb/mongodb.d.ts"/>
/// <reference path="../definitions/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../definitions/dummy-definitions/lastfm.d.ts"/>
/// <reference path="../definitions/typescript-node-definitions/winston.d.ts"/>

/*
Transition plan:
* Fix last.fm scraper
* Turn off scrobbling on the appfog app & permenantly enable this scrobbler
  * Remove all sessions
  * Update all None scrapers to last.fm scraper
  * Push to github and get on server
* Do front-end stuff & send to appfog
* Work out how to run front-end stuff on server
*/

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
import lfmScraper = require("./scrapers/LastfmScraper");

// Required environment variables
var STATION_CRYPTO_KEY = process.env.STATION_CRYPTO_KEY;
var USER_CRYPTO_KEY = process.env.USER_CRYPTO_KEY;
var MONGO_URI = process.env.MONGO_URI;
var LASTFM_API_KEY = process.env.LASTFM_API_KEY;
var LASTFM_SECRET = process.env.LASTFM_SECRET;
var SHOULD_SCROBBLE = process.env.SHOULD_SCROBBLE;

if (!STATION_CRYPTO_KEY || !USER_CRYPTO_KEY || !MONGO_URI || !LASTFM_API_KEY || !LASTFM_SECRET || !SHOULD_SCROBBLE) {
	winston.error("A required environment variable is missing:", process.env);
	process.exit(1);
}

var interval = 15000; // 15 seconds
var scrapers:{ [index: string]: scrap.Scraper; } = {
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
	TheCurrent: new theCurrent.TheCurrentScraper("TheCurrent"),
	SomaBagel: new lfmScraper.LastfmScraper("SomaBagel", "somabagel", LASTFM_API_KEY),
	SomaIllStreet: new lfmScraper.LastfmScraper("SomaIllStreet", "somaillstreet", LASTFM_API_KEY),
	SomaDroneZone: new lfmScraper.LastfmScraper("SomaDroneZone", "somadronezone", LASTFM_API_KEY),
	SomaSpaceStation: new lfmScraper.LastfmScraper("SomaSpaceStation", "somaspacestn", LASTFM_API_KEY),
	SomaSecretAgent: new lfmScraper.LastfmScraper("SomaSecretAgent", "somasecretagent", LASTFM_API_KEY),
	SomaGrooveSalad: new lfmScraper.LastfmScraper("SomaGrooveSalad", "somagroovesalad", LASTFM_API_KEY),
	SomaSonicUniverse: new lfmScraper.LastfmScraper("SomaSonicUniverse", "somasonicunivrs", LASTFM_API_KEY),
	SomaDigitalis: new lfmScraper.LastfmScraper("SomaDigitalis", "somadigitalis", LASTFM_API_KEY),
	BBCRadio1: new lfmScraper.LastfmScraper("BBCRadio1", "bbcradio1", LASTFM_API_KEY, true),
	BBC1Xtra: new lfmScraper.LastfmScraper("BBC1Xtra", "bbc1xtra", LASTFM_API_KEY, true),
	BBCRadio2: new lfmScraper.LastfmScraper("BBCRadio2", "bbcradio2", LASTFM_API_KEY, true),
	BBC6: new lfmScraper.LastfmScraper("BBC6", "bbc6music", LASTFM_API_KEY, true),
	SeriousRadio: new lfmScraper.LastfmScraper("SeriousRadio", "seriousradio", LASTFM_API_KEY, true),
	Absolute80s: new lfmScraper.LastfmScraper("Absolute80s", "absolute80s", LASTFM_API_KEY, true),
	AbsoluteRadio: new lfmScraper.LastfmScraper("AbsoluteRadio", "absoluteradio", LASTFM_API_KEY, true),
	Absolute60s: new lfmScraper.LastfmScraper("Absolute60s", "absoluterad60s", LASTFM_API_KEY, true),
	Absolute70s: new lfmScraper.LastfmScraper("Absolute70s", "absoluterad70s", LASTFM_API_KEY, true),
	Absolute90s: new lfmScraper.LastfmScraper("Absolute90s", "absoluterad90s", LASTFM_API_KEY, true),
	Absolute00s: new lfmScraper.LastfmScraper("Absolute00s", "absoluterad00s", LASTFM_API_KEY, true),
	AbsoluteClassic: new lfmScraper.LastfmScraper("AbsoluteClassic", "absoluteclassic", LASTFM_API_KEY, true),
	MutantRadio: new lfmScraper.LastfmScraper("MutantRadio", "mutant_radio", LASTFM_API_KEY),
	StuBruRadio: new lfmScraper.LastfmScraper("StuBruRadio", "stubruradio", LASTFM_API_KEY, true)
};

//////////////
// Proper scrobbler
//////////////
/*
var lastfmNode = new lastfm.LastFmNode({
	api_key: LASTFM_API_KEY,
	secret: LASTFM_SECRET,
	useragent: 'scrobblealong/v0.0.1 ScrobbleAlong'
});

var lastFmDao = SHOULD_SCROBBLE == "true" ? new lfmDao.LastFmDaoImpl(lastfmNode) : new lfmDao.DummyLastFmDao();

var scrobbler = new scrob.Scrobbler(lastFmDao);

function scrapeAndScrobbleAllStations(stationDao, userDao) {
	stationDao.getStations((err, stations: stat.Station[]) => {
		if (err) return; // Assume error logging is done by DAO

		_.each(stations, (station:stat.Station) => {
			if (!station) return; // break

			userDao.getUsersListeningToStation(station.StationName, (err, users:usr.User[]) => {
				if (err) return; // break
				scrobbler.scrapeAndScrobble(scrapers[station.ScraperName], station, users);
			});
		});
	});
};

mongodb.connect(MONGO_URI, (err, dbClient) => {
	if (err) {
		winston.err("Error connecting to MongoDB:", err);
		process.exit(1);
	}

	var stationDao = new statDao.MongoStationDao(dbClient, new crypt.CrypterImpl(STATION_CRYPTO_KEY));
	var userDao = new usrDao.MongoUserDao(dbClient, new crypt.CrypterImpl(USER_CRYPTO_KEY));

	setInterval(() => { scrapeAndScrobbleAllStations(stationDao, userDao); }, interval);
	scrapeAndScrobbleAllStations(stationDao, userDao);
});
*/

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
				if (!station) return; // break

				userDao.getUsersListeningToStation(station.StationName, (err, users:usr.User[]) => {
					if (err) return; // break
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
	{ StationName: "SomaBagel", ScraperName: "SomaBagel", Session: "SomaBagelSession" },
	{ StationName: "SomaIllStreet", ScraperName: "SomaIllStreet", Session: "SomaIllStreetSession" },
	{ StationName: "SomaDroneZone", ScraperName: "SomaDroneZone", Session: "SomaDroneZoneSession" },
	{ StationName: "SomaSpaceStation", ScraperName: "SomaSpaceStation", Session: "SomaSpaceStationSession" },
	{ StationName: "SomaSecretAgent", ScraperName: "SomaSecretAgent", Session: "SomaSecretAgentSession" },
	{ StationName: "SomaGrooveSalad", ScraperName: "SomaGrooveSalad", Session: "SomaGrooveSaladSession" },
	{ StationName: "SomaSonicUniverse", ScraperName: "SomaSonicUniverse", Session: "SomaSonicUniverseSession" },
	{ StationName: "SomaDigitalis", ScraperName: "SomaDigitalis", Session: "SomaDigitalisSession" },
	{ StationName: "BBCRadio1", ScraperName: "BBCRadio1", Session: "BBCRadio1Session" },
	{ StationName: "BBC1Xtra", ScraperName: "BBC1Xtra", Session: "BBC1XtraSession" },
	{ StationName: "BBCRadio2", ScraperName: "BBCRadio2", Session: "BBCRadio2Session" },
	{ StationName: "BBC6", ScraperName: "BBC6", Session: "BBC6Session" },
	{ StationName: "SeriousRadio", ScraperName: "SeriousRadio", Session: "SeriousRadioSession" },
	{ StationName: "Absolute80s", ScraperName: "Absolute80s", Session: "Absolute80sSession" },
	{ StationName: "AbsoluteRadio", ScraperName: "AbsoluteRadio", Session: "AbsoluteRadioSession" },
	{ StationName: "Absolute60s", ScraperName: "Absolute60s", Session: "Absolute60sSession" },
	{ StationName: "Absolute70s", ScraperName: "Absolute70s", Session: "Absolute70sSession" },
	{ StationName: "Absolute90s", ScraperName: "Absolute90s", Session: "Absolute90sSession" },
	{ StationName: "Absolute00s", ScraperName: "Absolute00s", Session: "Absolute00sSession" },
	{ StationName: "AbsoluteClassic", ScraperName: "AbsoluteClassic", Session: "AbsoluteClassicSession" },
	{ StationName: "MutantRadio", ScraperName: "MutantRadio", Session: "MutantRadioSession" },
	{ StationName: "StuBruRadio", ScraperName: "StuBruRadio", Session: "StuBruRadioSession" }
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
