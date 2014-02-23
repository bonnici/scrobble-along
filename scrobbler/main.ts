import scrap = require("./scrapers/Scraper");
import scrob = require("./Scrobbler");
import stat = require("./Station");
import statDao = require("./StationDao");
import lfmDao = require("./LastFmDao");

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

var interval = 15000; // 15 seconds
var scrapers:{ [index: string]: scrap.Scraper; } = {
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