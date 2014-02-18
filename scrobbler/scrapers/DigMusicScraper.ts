/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>
/// <reference path="../../definitions/DefinitelyTyped/underscore/underscore.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import _ = require("underscore");
import winston = require("winston");

export class DigMusicScraper extends scrap.Scraper {
	private url: string;

	constructor(baseUrl?: string) {
		super();
		this.url = baseUrl || "http://digmusic.net.au/player-data.php";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		this.fetchUrl(this.url, (err, body) => {
			if (err) return callback(err, null);
			return this.parseJson(body, callback);
		});
	}

	private parseJson(body: string, callback: (err, song:song.Song) => void): void {
		if (!body) {
			winston.warn("DigMusicScraper: No/invalid body", body);
			return callback(null, { Artist: null, Track: null });
		}

		try {
			var json = JSON.parse(body);
		}
		catch (e) {
			winston.error("Could not parse JSON body", body);
			return callback("Could not parse JSON body", null);
		}

		if (!json) {
			winston.warn("DigMusicScraper: Invalid JSON", json);
			return callback(null, { Artist: null, Track: null });
		}

		var artistName, title;
		_.each(json, function (element: any) {
			if (element && element.playing == 'now') {
				artistName = element.artistName;
				title = element.title;
			}
		});

		if (!artistName || !title) {
			winston.info("DigMusicScraper could not find song");
			return callback(null, { Artist: null, Track: null });
		}
		else {
			winston.info("DigMusicScraper found song " + artistName + " - " + title);
			return callback(null, { Artist: artistName, Track: title });
		}
	}
}