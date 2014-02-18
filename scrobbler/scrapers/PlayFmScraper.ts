/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import winston = require("winston");

export class PlayFmScraper extends scrap.Scraper {
	private url: string;

	constructor() {
		super();
		this.url = "http://nowplaying.playfm.cl/api/station/4f47e1a2ee909d6c7b0001db/nowplaying";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		this.fetchUrl(this.url, (err, body) => {
			if (err) return callback(err, null);
			return this.parseJson(body, callback);
		});
	}

	private parseJson(body: string, callback: (err, song:song.Song) => void): void {
		if (!body) {
			winston.warn("PlayFmScraper: No/invalid body", body);
			return callback(null, { Artist: null, Track: null });
		}

		try {
			var json = JSON.parse(body);
		}
		catch (e) {
			winston.error("Could not parse JSON body", body);
			return callback("Could not parse JSON body", null);
		}

		if (!json || !json.data) {
			winston.warn("PlayFmScraper: Invalid JSON", json);
			return callback(null, { Artist: null, Track: null });
		}

		if (!json.data.artist || !json.data.artist.name || !json.data.song || !json.data.song.title) {
			winston.info("PlayFmScraper could not find song");
			return callback(null, { Artist: null, Track: null });
		}

		winston.info("PlayFmScraper found song " + json.data.artist.name + " - " + json.data.song.title);
		return callback(null, { Artist: json.data.artist.name, Track: json.data.song.title });
	}
}