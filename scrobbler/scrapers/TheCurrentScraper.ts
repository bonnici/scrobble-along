/// <reference path="../../definitions/dummy-definitions/cheerio.d.ts"/>
/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import cheerio = require("cheerio");
import winston = require("winston");

export class TheCurrentScraper extends scrap.Scraper {

	private url: string;

	constructor(name:string) {
		super(name);
		this.url = "http://www.thecurrent.org/playlist";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		this.fetchUrl(this.url, (err, body) => {
			if (err) return callback(err, null);
			return this.parseHtml(body, callback);
		});
	}

	private parseHtml(body: string, callback: (err, song:song.Song) => void): void {
		if (!body) {
			winston.warn("TheCurrentScraper: No HTML body");
			return callback(null, { Artist: null, Track: null });
		}

		var $ = cheerio.load(body);

		var playlistRows = $('li#playlist li div.songDetails');

		if (playlistRows.length < 1) {
			winston.info("TheCurrentScraper could not find song");
			return callback(null, { Artist: null, Track: null });
		}

		var artist = playlistRows.first().find('h5.artist').text();
		var song = playlistRows.first().find('h5.title').text();

		if (!artist || !song) {
			winston.info("TheCurrentScraper could not find song");
			return callback(null, { Artist: null, Track: null });
		}

		artist = artist.trim();
		song = song.trim();

		if (!artist || !song) {
			winston.info("TheCurrentScraper could not find song");
			return callback(null, { Artist: null, Track: null });
		}
		else {
			winston.info("TheCurrentScraper found song " + artist + " - " + song);
			return callback(null, { Artist: artist, Track: song });
		}
	}
}