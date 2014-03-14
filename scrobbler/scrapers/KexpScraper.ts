/// <reference path="../../definitions/dummy-definitions/cheerio.d.ts"/>
/// <reference path="../../definitions/dummy-definitions/moment-timezone.d.ts"/>
/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("Scraper");
import song = require("../Song");

import cheerio = require("cheerio");
import moment = require('moment-timezone');
import util = require("util");
import winston = require("winston");

export class KexpScraper extends scrap.Scraper {
	public defaultStartTime: string = null; // Overridable for tests
	private baseUrl: string;

	constructor(name:string, baseUrl?: string) {
		super(name);
		this.baseUrl = baseUrl || "http://kexp.org/playlist/playlistupdates?channel=1&start=%s&since=%s";
	}

	public fetchAndParse(callback: (err, song:song.Song) => void): void {
		var fullUrl = util.format(this.baseUrl, this.startTime(), this.startTime());

		this.fetchUrl(fullUrl, (err, body) => {
			if (err) return callback(err, null);

			return this.parse(body, callback);
		});
	}

	// Separated so that it is mockable
	private startTime(): string {
		return this.defaultStartTime ||
			moment().tz("America/Los_Angeles").subtract('minutes', 30).format("YYYY-MM-DDTHH:mm:ss.SSS");
	}

	private parse(body: string, callback:(err, song:song.Song) => void): void {
		var $ = cheerio.load(body);
		var nowPlayingDiv:any = $.root().children('div').first();

		// Check for airbreak
		if (nowPlayingDiv.hasClass("AirBreak")) {
			winston.info("KexpScraper found an air break");
			return callback(null, { Artist: null, Track: null });
		}
		else if (nowPlayingDiv.hasClass("Play")) {
			var artist = nowPlayingDiv.find("div.ArtistName").text();
			var track = nowPlayingDiv.find("div.TrackName").text();

			if (artist && track) {
				winston.info("KexpScraper found song " + artist + " - " + track);
				return callback(null, { Artist: artist, Track: track });
			}
		}

		winston.info("KexpScraper could not find a song");
		return callback(null, { Artist: null, Track: null });
	}
}