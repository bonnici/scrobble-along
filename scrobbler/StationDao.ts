import s = require("./Station");

export interface StationDao {
	getStations(callback:(err, stations:s.Station[]) => void): void;
}

export class DummyStationDao implements StationDao {
	getStations(callback:(err, stations:s.Station[]) => void): void {
		return callback(null, [
			{ StationName: "Station 1", ScraperName: "Scraper1", Session: "" },
			{ StationName: "Station 2", ScraperName: "Scraper2", Session: "" },
			{ StationName: "Station 3", ScraperName: "Scraper1", Session: "" }
		]);
	}
}