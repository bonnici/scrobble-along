/// <reference path="../../definitions/dummy-definitions/cheerio.d.ts"/>
/// <reference path="../../definitions/dummy-definitions/moment-timezone.d.ts"/>

import song = require("../Song");
import scrap = require("Scraper");

import util = require("util");
import cheerio = require("cheerio");
import moment = require('moment-timezone');

export class KexpScraper extends scrap.Scraper {
	public defaultStartTime: string = null; // Overridable for tests
	private baseUrl: string;

	constructor(baseUrl?: string) {
		super();
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
			return callback(null, { Artist: null, Track: null });
		}
		else if (nowPlayingDiv.hasClass("Play")) {
			var artist = nowPlayingDiv.find("div.ArtistName").text();
			var track = nowPlayingDiv.find("div.TrackName").text();

			if (artist && track) {
				return callback(null, { Artist: artist, Track: track });
			}
			else {
				return callback(null, { Artist: null, Track: null });
			}
		}
	}
}