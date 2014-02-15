import stat = require("./Station");
import scrap = require("./Scraper");

//import _ = require("underscore");

export class Scrobbler {

	constructor(scrapers:{ [index: string]: scrap.Scraper; } ) {}

	scrapeAndScrobble(stations:stat.Station[]): void {
		//console.log("testing " + this.test + " " + x);
		for (var i = 0; i < stations.length; i++) {
			console.log(stations[i].StationName + " " + stations[i].ParserName);
		}
	}
}