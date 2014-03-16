/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import song = require("../Song");
import jsonScrap = require("JsonScraper");

import winston = require("winston");

export class LastfmScraper extends jsonScrap.JsonScraper {

	constructor(name:string, username:string, apiKey:string, private ignoreListening?:boolean) {

		super(name);
		this.url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=" + username + "&api_key=" +
			apiKey + "&limit=1&format=json"
	}

	extractSong(jsonData:any): song.Song {
		try {
			var track = jsonData['recenttracks']['track'];

			if (!track["artist"]) {
				track = track[0];
			}

			if (this.ignoreListening || track["@attr"] && track["@attr"]["nowplaying"] == "true") {
				return { Artist: track['artist']['#text'], Track: track['name'] };
			}
		}
		catch (err) {
			winston.warn("LastfmScraper: Invalid JSON", jsonData);
		}

		return { Artist: null, Track: null };
	}
}