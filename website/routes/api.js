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

	var stationDetails = {};
	async.map(stations, lastfmDao.getUserInfo, function(err, results) {
		if (err || results.length != stations.length) {
			winston.error("Error getting user info for stations:", err);
			res.status(500).send('Unexpected results while getting station last.fm details');
			return;
		}

		for (var i=0; i < stations.length; i++) {
			stationDetails[stations[i]] = results[i];
		}

		res.json(stationDetails);
	});
};

exports.stationLastfmTasteometer = function(req, res) {
	if (!req.query || !req.query.stations || !req.query.user) {
		res.json({});
		return;
	}

	var stations = req.query.stations.split(",");
	if (stations.length == 0) {
		res.json({});
		return;
	}

	var tasteometerData = [];
	_.each(stations, function(station) {
		tasteometerData.push({ user1: req.query.user, user2: station });
	});

	var tasteometerResults = {};
	async.map(tasteometerData, lastfmDao.getTasteometer, function(err, results) {
		if (err || results.length != tasteometerData.length) {
			winston.error("Error getting tasteometer:", err);
			res.status(500).send('Unexpected results while getting tasteometer details');
			return;
		}

		for (var i=0; i < tasteometerData.length; i++) {
			tasteometerResults[tasteometerData[i].user2] = results[i];
		}

		res.json(tasteometerResults);
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

exports.stopScrobbling = function(req, res) {
	//todo
	winston.info("stopScrobbling", req.body);
	res.send("ok");
	//res.status(500).send();
};

exports.scrobbleAlong = function(req, res) {
	//todo
	winston.info("scrobbleAlong", req.body);
	res.send("ok");
	//res.status(500).send();
};