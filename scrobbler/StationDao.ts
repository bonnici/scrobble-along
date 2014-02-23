import s = require("./Station");

export interface StationDao {
	getStations(callback:(err, stations:s.Station[]) => void): void;
}

export class DummyStationDao implements StationDao {
	getStations(callback:(err, stations:s.Station[]) => void): void {
		return callback(null, [
			{ ScraperName: "Scraper1", Session: "" },
			{ ScraperName: "Scraper2", Session: "" },
			{ ScraperName: "Scraper1", Session: "" }
		]);
	}
}