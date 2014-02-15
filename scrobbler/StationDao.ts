import s = require("./Station");

export interface StationDao {
	getStations(callback:(err, stations:s.Station[]) => void): void;
}

export class DummyStationDao implements StationDao {
	getStations(callback:(err, stations:s.Station[]) => void): void {
		return callback(null, [
			{ StationName: "Station 1", ParserName: "Parser1", Session: "" },
			{ StationName: "Station 2", ParserName: "Parser2", Session: "" },
			{ StationName: "Station 3", ParserName: "Parser1", Session: "" }
		]);
	}
}