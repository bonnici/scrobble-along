/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import winston = require("winston");

export class WfuvScraper extends scrap.Scraper {
	private url: string;
	private name: string;

	constructor(name: string) {
		super();
		this.url = "http://nowplaying.wfuv.org/playlistinfo2.php";
		this.name = name;
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		this.fetchUrl(this.url, (err, body) => {
			if (err) return callback(err, null);
			return this.parseJson(body, callback);
		});
	}

	private parseJson(body: string, callback: (err, song:song.Song) => void): void {
		if (!body || body.length < 14) {
			winston.warn("WfuvScraper: No/invalid body", body);
			return callback(null, { Artist: null, Track: null });
		}

		body = body.trim().substring(12, body.length - 2);

		try {
			var json = JSON.parse(body);
		}
		catch (e) {
			winston.error("Could not parse JSON body", body);
			return callback("Could not parse JSON body", null);
		}

		if (!json || !json[this.name]) {
			winston.warn("WfuvScraper: Invalid JSON", json);
			return callback(null, { Artist: null, Track: null });
		}

		if (!json[this.name].artist || !json[this.name].title) {
			winston.info("WfuvScraper could not find song");
			return callback(null, { Artist: null, Track: null });
		}

		var artist = json[this.name].artist.trim();
		var title = json[this.name].title.trim();

		if (!artist || !title) {
			winston.info("WfuvScraper could not find song");
			return callback(null, { Artist: null, Track: null });
		}
		else {
			winston.info("WfuvScraper found song " + artist + " - " + title);
			return callback(null, { Artist: artist, Track: title });
		}
	}
}