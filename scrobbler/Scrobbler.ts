import stat = require("./Station");
import scrap = require("./scrapers/Scraper");

//import _ = require("underscore");

export class Scrobbler {

	constructor(private scrapers:{ [index: string]: scrap.Scraper; } ) {}

	scrapeAndScrobble(stations:stat.Station[]): void {
		//console.log("testing " + this.test + " " + x);
		for (var i = 0; i < stations.length; i++) {
			console.log(stations[i].StationName + " " + stations[i].ParserName);
			var scraper = this.scrapers[stations[i].ParserName];
			if (scraper) {
				scraper.fetchAndParse((err, song) => {
					if (!err) {
						if (song) {
							console.log("Scraped song " + song.Artist + " - " + song.Track);
						}
						else {
							console.log("Could not scrape song");
						}
					}
					// Assume error logging is done by scraper
				});
			}
			else {
				//todo log
			}
		}
	}
}