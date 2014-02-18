/// <reference path="../../definitions/dummy-definitions/cheerio.d.ts"/>
/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import cheerio = require("cheerio");
import winston = require("winston");

export class SomaScraper extends scrap.Scraper {
	private url: string;

	constructor(station: string) {
		super();
		this.url = "http://somafm.com/" + station + "/songhistory.html";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		this.fetchUrl(this.url, (err, body) => {
			if (err) return callback(err, null);
			return this.parseHtml(body, callback);
		});
	}

	private parseHtml(body: string, callback: (err, song:song.Song) => void): void {
		if (!body) {
			winston.warn("SomaScraper: No HTML body");
			return callback(null, { Artist: null, Track: null });
		}

		var $ = cheerio.load(body);

		var playlistRows = $('#playinc table tr');

		if (playlistRows.length < 2) {
			winston.warn("SomaScraper: Not enough playlist rows (" + playlistRows.length + ")");
			return callback(null, { Artist: null, Track: null });
		}

		var firstSongRow = playlistRows.eq(2);

		if (firstSongRow.children("td").length < 3) {
			winston.warn("SomaScraper: Not enough playlist cols (" + firstSongRow.children("td").length + ")");
			return callback(null, { Artist: null, Track: null });
		}

		var time = firstSongRow.children("td").first().text();
		var artist = firstSongRow.children("td").eq(1).text();
		var song = firstSongRow.children("td").eq(2).text();

		if (!time || time == '' || !artist || artist == '' || !song || song == '') {
			winston.warn("SomaScraper: Invalid cols (" + time + "/" + artist + "/" + song + ")");
			return callback(null, { Artist: null, Track: null });
		}

		if (time.toLowerCase().indexOf("(now)") == -1) {
			winston.info("SomaScraper did not find a currently playing song");
			return callback(null, { Artist: null, Track: null });
		}
		else {
			winston.info("SomaScraper found song " + artist + " - " + song);
			return callback(null, { Artist: artist, Track: song });
		}
	}
}