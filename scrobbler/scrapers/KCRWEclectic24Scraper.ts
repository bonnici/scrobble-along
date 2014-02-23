/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import winston = require("winston");

export class KcrwEclectic24Scraper extends scrap.Scraper {
	private url: string;

	constructor() {
		super();
		this.url = "http://www.kcrw.com/json_song";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		this.fetchUrl(this.url, (err, body) => {
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
			winston.warn("KCRWEclectic24Scraper: Invalid json", json);
			return callback(null, { Artist: null, Track: null });
		}

		if (!json.artist || !json.title) {
			winston.warn("KCRWEclectic24Scraper: Invalid track", { title: json.title, artist: json.artist });
			return callback(null, { Artist: null, Track: null });
		}

		winston.info("KCRWEclectic24Scraper found song " + json.artist + " - " + json.title);
		return callback(null, { Artist: json.artist, Track: json.title });
	}
}