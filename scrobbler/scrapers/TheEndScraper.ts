/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import winston = require("winston");

export class TheEndScraper extends scrap.Scraper {
	private url: string;

	constructor() {
		super();
		this.url = "http://kndd.tunegenie.com/w2/pluginhour/since/kndd/";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		var sinceTime = new Date().getTime() - (60 * 60 * 1000); // Get all of last hour's songs
		var timestampedUrl = this.url + sinceTime + "/?x=" + new Date().getTime();
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
			winston.error("Could not parse JSON body", body);
			return callback("Could not parse JSON body", null);
		}

		if (!json || json.length == 0) {
			winston.warn("TheEndScraper: Invalid json", json);
			return callback(null, { Artist: null, Track: null });
		}

		var lastTrack = json.length - 1;

		if (!json[lastTrack].artistName || !json[lastTrack].trackName) {
			winston.warn("TheEndScraper: Invalid last track", { trackName: json[lastTrack].trackName, artistName: json[lastTrack].artistName });
			return callback(null, { Artist: null, Track: null });
		}

		winston.info("TheEndScraper found song " + json[lastTrack].artistName + " - " + json[lastTrack].trackName);
		return callback(null, { Artist: json[lastTrack].artistName, Track: json[lastTrack].trackName });
	}
}