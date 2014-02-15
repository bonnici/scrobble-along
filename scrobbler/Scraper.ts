import song = require("./Song");

// Abstract base class
export class Scraper {

	// Should call success with a song if it was found, success with null artist/track if no song was found,
	// failure if there was a recoverable error fetching or parsing
	public fetchAndParse(callback: (err, song: song.Song) => void): void {
		throw new Error("Abstract");
	}

	// protected
	public fetchUrl(fullUrl: string, callback: (err, body:string) => void): void {
		return this.fetchUrlWithHeaders(fullUrl, {}, callback);
	}

	// protected
	public fetchUrlWithHeaders(fullUrl: string, headers, callback: (err, body:string) => void): void {
		//todo
		return callback(null, "body");
		//winston.info("Fetching URL", fullUrl);
		//winston.info("With headers", headers);
		/*
		request({ url: fullUrl, headers: headers }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				return success(body);
			}

			if (error) {
				winston.error("Error requesting URL " + fullUrl, error);
				return failure("Error during request");
			}
			else {
				return failure("Bad status code (" + response.statusCode + ") fetching URL " + fullUrl);
			}

		});
		*/
	}
}

export class DummyScraper extends Scraper {
	constructor(public suffix: string) {
		super();
	}

	public fetchAndParse(callback: (err, song: song.Song) => void): void {
		var songs = [
			{ Artist: "Artist 1 " + this.suffix, Track: "Track 1 " + this.suffix },
			{ Artist: "Artist 2 " + this.suffix, Track: "Track 3 " + this.suffix },
			{ Artist: "Artist 3 " + this.suffix, Track: "Track 3 " + this.suffix }
		];
		var index =  Math.floor(Math.random()*songs.length);
		return callback(null, songs[index]);
	}

}