/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import song = require("../Song");
import scrap = require("Scraper");

import winston = require("winston");

/*
Base class for scrapers that get JSON data. Other JSON scrapers should be migrated to this eventually.
To use, set this.url in the constructor after calling super and implement extractSong.
*/

export class JsonScraper extends scrap.Scraper {
	url: string;

	constructor(name:string) {
		super(name);
	}

	public fetchAndParse(callback:(err, song:song.Song) => void): void {
		this.fetchUrl(this.url, (err, body) => {
			if (err) return callback(err, null);

			if (!body) {
				winston.warn("JsonScraper: No/invalid body", body);
				callback(null, { Artist: null, Track: null });
				return;
			}

			try {
				var json = JSON.parse(body);
			}
			catch (e) {
				winston.error("Could not parse JSON body", body);
				callback("Could not parse JSON body", null);
				return;
			}

			callback(null, this.extractSong(json));
			return
		});
	}

	extractSong(jsonData:any): song.Song {
		throw "Abstract function"
	}
}