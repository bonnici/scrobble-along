var _ = require("underscore");
var winston = require("winston");

var MongoDao = (function () {
	function MongoDao(userCrypter, stationCrypter, dbClient) {
		this.userCrypter = userCrypter;
		this.stationCrypter = stationCrypter;
		this.dbClient = dbClient;
	}

	MongoDao.prototype.storeUserSession = function (username, encryptedSession, callback) {
		this.dbClient.collection('user', function (error, collection) {
			if (error) {
				callback(error, null);
				return;
			}

			collection.findAndModify(
				{ _id: username },
				[['_id', 'asc']],
				{ $set: { session: encryptedSession } },
				{ upsert: true },
				function (error, object) {
					if (error) {
						var message = "Could not update session of user " + username + ": " + error.message;
						callback(message, null);
					}
					else {
						callback(null, "ok");
					}
				});
		});
	};

	MongoDao.prototype.getUserData = function (encryptedSession, callback) {
		this.dbClient.collection('user', function (error, collection) {
			if (error) {
				callback(error, null);
			}
			else {
				collection.findOne({session: encryptedSession}, callback);
			}
		});
	};

	MongoDao.prototype.getStations = function (callback) {
		this.dbClient.collection('station', function (error, collection) {
			if (error) {
				callback(error, null);
			}
			else {
				collection.find().toArray(callback);
			}
		});
	};

	MongoDao.prototype.setUserScrobbling = function (username, stationName, callback) {
		var updates = {};
		if (stationName) {
			updates = { $set: { listening: stationName } };
			winston.info("Setting user " + username + " as scrobbling " + stationName);
		}
		else {
			updates = { $unset: { listening: 1 } };
			winston.info("Setting user " + username + " as not scrobbling");
		}

		this.dbClient.collection('user', function (error, collection) {
			if (error) {
				callback(error, null);
				return;
			}

			collection.findAndModify(
				{ _id: username },
				[['_id', 'asc']],
				updates,
				{ upsert: false },
				function (error, record) {
					if (error) {
						var message = "Could not update listening of user " + username + ": " + error.message;
						winston.error(message);
						callback(error, null);
					}
					else {
						callback(null, "ok");
					}
				});
		});
	};

	MongoDao.prototype.getAllUserData = function(callback) {
		var crypter = this.userCrypter;
		this.dbClient.collection('user', function (error, collection) {
			if (error) {
				callback(error, null);
				return;
			}

			collection.find().toArray(function(err, data) {
				if (err) {
					callback(err, null);
					return;
				}

				_.each(data, function(record) {
					if (record.session) {
						record.session = crypter.decrypt(record.session);
					}
				});
				callback(null, data);
			});
		});
	};

	MongoDao.prototype.getAllStationData = function(callback) {
		var crypter = this.stationCrypter;
		this.dbClient.collection('station', function (error, collection) {
			if (error) {
				callback(error, null);
				return;
			}

			collection.find().toArray(function(err, data) {
				if (err) {
					callback(err, null);
					return;
				}

				_.each(data, function(record) {
					if (record.session) {
						record.session = crypter.decrypt(record.session);
					}
				});
				callback(null, data);
			});
		});
	}

	MongoDao.prototype.addStation = function(station, callback) {
		if (!station || !station['_id']) {
			callback("Invalid station");
			return;
		}

		var crypter = this.stationCrypter;

		var stationFields = { _id: station['_id'] };
		if (station.parser) { stationFields.parser = station.parser };
		if (station.scraperParam) { stationFields.scraperParam = station.scraperParam };
		if (station.disabled) { stationFields.disabled = 'true' };
		if (station.stationUrl) { stationFields.stationUrl = station.stationUrl };
		if (station.streamUrl) { stationFields.streamUrl = station.streamUrl };
		if (station.session) { stationFields.session = crypter.encrypt(station.session) };

		this.dbClient.collection('station', function (error, collection) {
			collection.insert(stationFields, callback);
		});
	};

	MongoDao.prototype.updateStation = function(station, callback) {
		if (!station || !station['_id']) {
			callback("Invalid station");
			return;
		}

		var crypter = this.stationCrypter;

		var stationFields = { };
		if (station.parser) { stationFields.parser = station.parser }
		if (station.scraperParam) { stationFields.scraperParam = station.scraperParam }
		if (station.stationUrl) { stationFields.stationUrl = station.stationUrl }
		if (station.streamUrl) { stationFields.streamUrl = station.streamUrl }
		if (station.session) { stationFields.session = crypter.encrypt(station.session) }

		if (station.disabled == 'true') {
			stationFields.disabled = 'true';
		}
		else {
			stationFields.disabled = 'false';
		}

		this.dbClient.collection('station', function (error, collection) {
			collection.findAndModify(
				{ _id: station['_id'] },
				[['_id', 'asc']],
				{ $set: stationFields },
				{ upsert: true },
				callback
			);
		});
	};

	MongoDao.prototype.clearUserListening = function(username, callback) {
		if (!username) {
			callback("Invalid username");
			return;
		}

		this.dbClient.collection('user', function (error, collection) {
			collection.findAndModify(
				{ _id: username },
				[['_id', 'asc']],
				{ $unset: { listening: "" } },
				{ update: true },
				callback
			);
		});
	};

	MongoDao.prototype.clearUserSession = function(username, callback) {
		if (!username) {
			callback("Invalid username");
			return;
		}

		this.dbClient.collection('user', function (error, collection) {
			collection.findAndModify(
				{ _id: username },
				[['_id', 'asc']],
				{ $unset: { session: "" } },
				{ update: true },
				callback
			);
		});
	};

	return MongoDao;
})();
exports.MongoDao = MongoDao;
