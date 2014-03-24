/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import scrap = require("CheerioScraper");
import song = require("../Song");

import winston = require("winston");

export class WfmuScraper extends scrap.CheerioScraper {
	constructor(name:string) {
		super(name);
	}

	public getUrl(): string {
		return "http://wfmu.org/currentliveshows_aggregator.php?ch=1";
	}

	public parseCheerio($:any, callback: (err, newNowPlayingSong: song.Song, justScrobbledSong?:song.Song) => void): void {
		/*
		 Example (cutdown):

		 <div id="nowplaysong">
			 <div id="nowplaying">
				 <div class="bigline">
					 <span class="KDBFavIcon KDBsong" id="KDBsong-1354099">
						 <a href="http://www.wfmu.org/auth.php?a=fav_icon_clicked&amp;type=song&amp;id=1354099&amp;page_type=homepage&amp;page_id=1&amp;r=http%3A%2F%2Fwww.wfmu.org%2F"
						 onclick="KDBFav.fav_icon_clicked(event, this.parentNode);"
						 title="Click for options"
						 ><img src="/Gfx/star_empty_2.png" border="0" alt="Options" /></a>
					 </span>
					 &quot;Down &amp; To The Left&quot;
					 by
					 Amon Tobin
				 </div>
			 </div>
		 </div>
		 */

		var songDiv = $('div#nowplaysong div#nowplaying div.bigline');

		if (songDiv.length < 1) {
			winston.warn("WfmuScraper: No song div", { songDivLength: songDiv.length });
			callback(null, { Artist: null, Track: null });
			return;
		}

		var songText = songDiv.eq(0).text();

		if (!songText.trim()) {
			winston.warn("WfmuScraper: Blank text", { songText: songText });
			callback(null, { Artist: null, Track: null });
			return;
		}

		songText = songText.trim();

		// Text should be of the form "title" by artist
		var firstQuote = songText.indexOf('"');
		var lastQuote = songText.lastIndexOf('"');

		if (firstQuote != 0 || lastQuote <= 0 || songText.length <= lastQuote + 4) {
			winston.warn("WfmuScraper: Invalid text", { songText: songText });
			callback(null, { Artist: null, Track: null });
			return;
		}

		var byText = songText.substring(lastQuote + 1, lastQuote + 5);
		if (byText != "\nby\n") {
			winston.warn("WfmuScraper: Invalid text [" + byText + "]");
			callback(null, { Artist: null, Track: null });
			return;
		}

		var titleText = songText.substring(1, lastQuote).trim();
		var artistText = songText.substring(lastQuote + 4).trim();

		if (artistText && titleText) {
			winston.info("WfmuScraper found song " + artistText + " - " + titleText);
			callback(null, { Artist: artistText, Track: titleText });
		}
		else {
			winston.info("WfmuScraper could not find song");
			callback(null, { Artist: null, Track: null });
		}
	}
}