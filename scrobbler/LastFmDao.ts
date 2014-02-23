import s = require("./Song");

import winston = require("winston");

export interface LastFmDao {
	postNowPlaying(song:s.Song, callback?:(err, status)=>void): void;
	scrobble(song:s.Song, callback?:(err, status)=>void): void;
}

export class DummyLastFmDao implements LastFmDao {
	postNowPlaying(song:s.Song, callback?:(err, status)=>void): void {
		callback = callback || (() => {});

		if (song.Artist && song.Track) {
			winston.info("Faking post now playing of song:", song);
			callback(null, "OK");
		}
		else {
			callback("Invalid song", null);
		}
	}

	scrobble(song:s.Song, callback?:(err, status)=>void): void {
		callback = callback || (() => {});

		if (song.Artist && song.Track) {
			winston.info("Faking scrobble of song:", song);
			callback(null, "OK");
		}
		else {
			callback("Invalid song", null);
		}
	}
}