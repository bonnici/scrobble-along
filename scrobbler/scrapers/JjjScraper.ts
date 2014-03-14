/// <reference path="../../definitions/dummy-definitions/cheerio.d.ts"/>
/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import cheerio = require("cheerio");
import winston = require("winston");

export class JjjScraper extends scrap.Scraper {
	private baseUrl: string;

	constructor(name:string, baseUrl?: string) {
		super(name);
		this.baseUrl = baseUrl || "http://www.abc.net.au/triplej/feeds/playout/triplej_sydney_playout.xml";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		this.fetchUrl(this.baseUrl, (err, body) => {
			if (err) return callback(err, null);
			return this.parse(body, callback);
		});
	}

	private parse(body: string, callback: (err, song:song.Song) => void): void {
		var $ = cheerio.load(body);
		var nowPlayingItem = $.root().find('item').first();
		var playingTime: any = nowPlayingItem.find('playing');

		if (playingTime.length > 0 && playingTime.first().text().toLowerCase() == "now") {
			var artists: any = nowPlayingItem.find('artistname');
			var tracks: any = nowPlayingItem.find('title');

			if (artists.length > 0 && tracks.length > 0) {
				var artist = artists.first().text();
				var track = tracks.first().text();

				if (artist && track) {
					winston.info("JjjScraper found song " + artist + " - " + track);
					return callback(null, { Artist: artist, Track: track });
				}
			}
		}

		winston.info("JjjScraper could not find song");
		return callback(null, { Artist: null, Track: null });
	}
}