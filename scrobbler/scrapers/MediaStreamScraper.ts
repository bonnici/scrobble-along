/// <reference path="../../definitions/typescript-node-definitions/winston.d.ts"/>

import song = require("../Song");
import jsonScrap = require("JsonScraper");

import winston = require("winston");

export class MediaStreamScraper extends jsonScrap.JsonScraper {

	constructor(name:string, id:string) {
		super(name);
		this.url = "http://nowplaying.mediastre.am/api/station/" + id + "/nowplaying";
	}

	extractSong(jsonData:any): song.Song {
		return {
			Artist: jsonData.data.artist.name,
			Track: jsonData.data.song.title
		};
	}
}