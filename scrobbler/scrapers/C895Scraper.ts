/// <reference path="../../definitions/dummy-definitions/cheerio.d.ts"/>
/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import cheerio = require("cheerio");
import winston = require("winston");

export class C895Scraper extends scrap.Scraper {

	private url: string;

	constructor(name:string) {
		super(name);
		this.url = "http://www.c895.org/playlist/";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		this.fetchUrl(this.url, (err, body) => {
			if (err) return callback(err, null);
			return this.parseHtml(body, callback);
		});
	}

	private parseHtml(body: string, callback: (err, song:song.Song) => void): void {
		if (!body) {
			winston.warn("C895Scraper: No HTML body");
			return callback(null, { Artist: null, Track: null });
		}

		var $ = cheerio.load(body);

		var playlistRows = $('table#playlist tr');

		if (playlistRows.length < 1) {
			winston.warn("C895Scraper: Not enough playlist rows (" + playlistRows.length + ")");
			return callback(null, { Artist: null, Track: null });
		}

		var firstSongRow = playlistRows.eq(1);

		if (firstSongRow.children("td").length < 3) {
			winston.warn("C895Scraper: Not enough playlist cols (" + firstSongRow.children("td").length + ")");
			return callback(null, { Artist: null, Track: null });
		}

		var artist = firstSongRow.children("td").eq(1).text();
		var song = firstSongRow.children("td").eq(2).text();

		if (firstSongRow.children("td").length >= 3) {
			var mix = firstSongRow.children("td").eq(3).text();
			if (mix) {
				song += " (" + mix + ")";
			}
		}

		if (!artist || artist == '' || !song || song == '') {
			winston.warn("C895Scraper: Invalid cols (" + artist + "/" + song + ")");
			return callback(null, { Artist: null, Track: null });
		}

		winston.info("C895Scraper found song " + artist + " - " + song);
		return callback(null, { Artist: artist, Track: song });
	}
}