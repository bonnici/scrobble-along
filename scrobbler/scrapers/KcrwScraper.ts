/// <reference path="../../definitions/dummy-definitions/cheerio.d.ts"/>
/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import cheerio = require("cheerio");
import winston = require("winston");

export class KcrwScraper extends scrap.Scraper {

	private url: string;

	constructor(name:string) {
		super(name);
		this.url = "http://newmedia.kcrw.com/tracklists/index.php?channel=Live";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		this.fetchUrl(this.url, (err, body) => {
			if (err) return callback(err, null);
			return this.parseHtml(body, callback);
		});
	}

	private parseHtml(body: string, callback: (err, song:song.Song) => void): void {
		if (!body) {
			winston.warn("KcrwScraper: No HTML body");
			return callback(null, { Artist: null, Track: null });
		}

		var $ = cheerio.load(body);

		var playlistRows = $("table#table_tracklist tbody tr");

		if (playlistRows.length < 1) {
			winston.warn("KcrwScraper: Not enough playlist rows (" + playlistRows.length + ")");
			return callback(null, { Artist: null, Track: null });
		}

		var firstSongRow = playlistRows.eq(0);

		if (firstSongRow.children("td").length < 3) {
			winston.warn("KcrwScraper: Not enough playlist cols (" + firstSongRow.children("td").length + ")");
			return callback(null, { Artist: null, Track: null });
		}

		var artist = firstSongRow.children("td").eq(1).text();
		var song = firstSongRow.children("td").eq(2).text();

		if (!artist || artist == '' || !song || song == '' || artist == 'Break' || song == "Break") {
			winston.warn("KcrwScraper: Invalid cols (" + artist + "/" + song + ")");
			return callback(null, { Artist: null, Track: null });
		}

		winston.info("KcrwScraper found song " + artist + " - " + song);
		return callback(null, { Artist: artist, Track: song });
	}
}