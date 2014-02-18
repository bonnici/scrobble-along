/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import winston = require("winston");

export class PunkFmScraper extends scrap.Scraper {
	private url: string;

	constructor() {
		super();
		this.url = "http://centovacast.galaxywebsolutions.com/external/rpc.php?m=streaminfo.get&username=punkfm&charset=&mountpoint=&rid=punkfm&_=";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		var timestampedUrl = this.url + new Date().getTime();
		this.fetchUrl(timestampedUrl, (err, body) => {
			if (err) return callback(err, null);
			return this.parseJson(body, callback);
		});
	}

	private parseJson(body: string, callback: (err, song:song.Song) => void): void {
		if (!body) {
			return callback(null, { Artist: null, Track: null });
		}

		try {
			var json = JSON.parse(body);
		}
		catch (e) {
			winston.error("PunkFmScraper: Could not parse JSON body", body);
			return callback("Could not parse JSON body", null);
		}

		if (!json) {
			winston.warn("PunkFmScraper: Invalid json", json);
			return callback(null, { Artist: null, Track: null });
		}

		if (!json.data || json.data.length < 1 || !json.data[0].track || !json.data[0].track.artist || !json.data[0].track.title) {
			winston.warn("PunkFmScraper: Invalid json", json);
			return callback(null, { Artist: null, Track: null });
		}

		winston.info("PunkFmScraper found song " + json.data[0].track.artist + " - " + json.data[0].track.title);
		return callback(null, { Artist: json.data[0].track.artist, Track: json.data[0].track.title });
	}
}