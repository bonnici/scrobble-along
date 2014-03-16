/// <reference path="../../definitions/dummy-definitions/cheerio.d.ts"/>
/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import cheerio = require("cheerio");
import winston = require("winston");

export class InfinitaScraper extends scrap.Scraper {
	private url: string;

	constructor(name:string) {
		super(name);
		this.url = "http://www.infinita.cl/datas/ahora.xml";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		this.fetchUrl(this.url, (err, body) => {
			if (err) return callback(err, null);
			return this.parseHtml(body, callback);
		});
	}

	private parseHtml(body: string, callback: (err, song:song.Song) => void): void {
		if (!body) {
			winston.warn("InfinitaScraper: No HTML body");
			callback(null, { Artist: null, Track: null });
			return;
		}

		var $ = cheerio.load(body);

		var artistData = $('interprete').text();
		var songData = $('nombre').text();

		if (!artistData || !songData) {
			callback(null, { Artist: null, Track: null });
			return;
		}

		var artistName = artistData.trim();
		var songName = songData.trim();

		if (!artistName || !songName) {
			callback(null, { Artist: null, Track: null });
		} else {
			callback(null, { Artist: artistName, Track: songName });
		}
	}
}