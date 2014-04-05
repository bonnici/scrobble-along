/*
 * Serve JSON to our AngularJS client
 */

var _ = require("underscore");
var async = require("async");
var winston = require("winston");

var lastfmDao = null;
var mongoDao = null;

exports.init = function(lfm, mng) {
	lastfmDao = lfm;
	mongoDao = mng;
};

exports.loginUrl = function (req, res) {
	res.json({
		loginUrl: 'http://www.last.fm/api/auth/?api_key=' + process.env.SA_LASTFM_API_KEY +
			'&cb=' + process.env.SA_BASE_URL + '/login'
	});
};

exports.userDetails = function (req, res) {
	var session = req.cookies['lastfmSession'];
	if (!session) {
		res.json({
			username: null,
			listening: null,
			scrobbles: null
		});
		return;
	}

	mongoDao.getUserData(session, function (err, record) {
		if (err) {
			winston.error("Error loading user:", err);
			res.status(500).send('Error loading user from database');
		}
		else if (!record) {
			res.json({
				username: null,
				listening: null,
				scrobbles: null
			});
		}
		else if (!record['_id']) {
			winston.error("Invalid user record:", record);
			res.status(500).send('Invalid record in database');
		}
		else {
			res.json({
				username: record['_id'],
				listening: record['listening'],
				scrobbles: record['scrobbles']
			});
		}
	});

};

exports.stations = function (req, res) {
	mongoDao.getStations(function (err, stationArray) {
		if (err) {
			winston.error("Error loading stations:", err);
			res.status(500).send('Error loading stations from database');
		}
		else if (!stationArray) {
			winston.error("Invalid station records:", stationArray);
			res.status(500).send('Invalid result from database');
		}
		else {
			var stations = [];
			_.each(stationArray, function(record) {
				if (record && record['_id'] && record['disabled'] != "true") {
					stations.push({
						lastfmUsername: record['_id'],
						stationUrl: record['stationUrl'],
						streamUrl: record['streamUrl']
					});
				}
			});
			res.json(stations);
		}
	});
};

exports.userLastfmInfo = function(req, res) {
	if (!req.query || !req.query.user) {
		res.json({ lastfmProfileImage: null });
		return;
	}

	lastfmDao.getUserInfo(req.query.user, function(err, details) {
		if (err || !details.lastfmProfileImage) {
			winston.error("Error getting user info for user:", err);
			res.status(500).send('Error loading user last.fm details');
		}
		else {
			res.json({ lastfmProfileImage: details.lastfmProfileImage });
		}
	});
};

exports.stationLastfmInfo = function(req, res) {
	if (!req.query || !req.query.stations) {
		res.json([]);
		return;
	}

	var stations = req.query.stations.split(",");
	if (stations.length == 0) {
		res.json([]);
		return;
	}

	//var stationDetails = {};

	var tasteometerData = [];
		if (req.query.user) {
		_.each(stations, function(station) {
			tasteometerData.push({ user1: req.query.user, user2: station });
		});
	}

	async.parallel([
		function(callback) {
			var stationDetails = {};
			async.map(stations, lastfmDao.getUserInfo, function(err, results) {
				if (err || results.length != stations.length) {
					winston.error("Error getting user info for stations:", err);
					callback(err);
					return;
				}

				for (var i=0; i < stations.length; i++) {
					stationDetails[stations[i]] = results[i];
				}

				callback(null, stationDetails);
			});
		},

		function(callback) {
			var tasteometerResults = {};
			async.map(tasteometerData, lastfmDao.getTasteometer, function(err, results) {
				if (err || results.length != tasteometerData.length) {
					winston.error("Error getting tasteometer:", err);
					callback(err);
					return;
				}

				for (var i=0; i < tasteometerData.length; i++) {
					tasteometerResults[tasteometerData[i].user2] = results[i];
				}

				callback(null, tasteometerResults);
			});
		}
	], function(err, results) {
		if (!results || !results.size == 2) {
			callback("Unexpected result from async.parallel");
			return;
		}
		var combinedResults = results[0];
		_.each(results[1], function(tasteometerInfo, stationName) {
			if (combinedResults[stationName]) {
				combinedResults[stationName].tasteometer = tasteometerInfo;
			}
			else {
				//todo log?
				combinedResults[stationName] = { tasteometer: tasteometerInfo };
			}
		});
		res.json(combinedResults);
	});
};


exports.stationLastfmRecentTracks = function(req, res) {
	if (!req.query || !req.query.stations) {
		res.json({});
		return;
	}

	var stations = req.query.stations.split(",");
	if (stations.length == 0) {
		res.json({});
		return;
	}

	var recentTracks = {};
	async.map(stations, lastfmDao.getRecentTracks, function(err, results) {
		if (err || results.length != stations.length) {
			winston.error("Error getting recent tracks:", err);
			res.status(500).send('Unexpected results while getting station\'s recent tracks');
			return;
		}

		for (var i=0; i < stations.length; i++) {
			recentTracks[stations[i]] = results[i];
		}

		res.json(recentTracks);
	});
};

var updateScrobbling = function(req, res, stationName) {
	// Load user details from cookie
	var session = req.cookies['lastfmSession'];
	if (!session) {
		winston.error("Session cookie not provided when stopping scrobble");
		res.status(500).send("Session cookie is required to stop scrobbling");
		return;
	}

	mongoDao.getUserData(session, function (err, record) {
		if (err || !record || !record['_id']) {
			winston.error("Error loading user while stopping scrobble:", err);
			res.status(500).send('Error stopping scrobble');
		}
		var username = record['_id'];
		mongoDao.setUserScrobbling(username, stationName, function(err, status) {
			if (err) {
				winston.error("Error setting user as not scrobbling:", err);
				res.status(500).send('Error stopping scrobble');
			}
			else {
				res.send("ok");
			}
		});
	});
}

exports.stopScrobbling = function(req, res) {
	updateScrobbling(req, res, null);
};

exports.scrobbleAlong = function(req, res) {
	if (!req.body || !req.body.username) {
		winston.error("Station username was not provided in request to scrobble");
		res.status(500).send('Station username must be provided');
		return;
	}
	updateScrobbling(req, res, req.body.username);
};