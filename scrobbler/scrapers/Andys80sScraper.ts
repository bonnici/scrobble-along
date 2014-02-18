/// <reference path="../../definitions/dummy-definitions/cheerio.d.ts"/>
/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import cheerio = require("cheerio");
import winston = require("winston");

export class Andys80sScraper extends scrap.Scraper {

	private url: string;

	constructor() {
		super();
		this.url = "http://www.andys80s.com/playing.html";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		this.fetchUrl(this.url, (err, body) => {
			if (err) return callback(err, null);
			return this.parseHtml(body, callback);
		});
	}

	private parseHtml(body: string, callback: (err, song:song.Song) => void): void {
		if (!body) {
			winston.warn("Andys80sScraper: No HTML body");
			return callback(null, { Artist: null, Track: null });
		}

		var $ = cheerio.load(body);

		// html is malformed, just get all TRs, find the one with a TD that says "Currently Playing", and use the next row

		var target = -1;
		var songText = '';
		$('tr').each(function(i, elem) {
			var tds = $(this).children('td');
			if (i == target) {
				if (tds.length >= 1) {
					songText = tds.eq(0).text().trim();
				}
				return;
			}

			if (tds.length >= 1) {
				if (tds.eq(0).text().trim().toLowerCase() == 'currently playing') {
					target = i + 1;
				}
			}
		});

		songText = songText.trim();
		if (!songText) {
			winston.info("Andys80sScraper could not find song");
			return callback(null, { Artist: null, Track: null });
		}

		// This will probably break for some artists
		var separator = songText.indexOf(" - ");
		if (separator < 0) {
			winston.info("Andys80sScraper could not find song");
			return callback(null, { Artist: null, Track: null });
		}

		var artistText = songText.substring(0, separator).trim();
		var songText = songText.substring(separator+3).trim();

		if (!artistText || !songText) {
			winston.info("Andys80sScraper could not find song");
			return callback(null, { Artist: null, Track: null });
		}
		else {
			winston.info("Andys80sScraper found song " + artistText + " - " + songText);
			return callback(null, { Artist: artistText, Track: songText });
		}
	}
}