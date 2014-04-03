var winston = require("winston");

//todo more logging
var MongoDao = (function () {
	function MongoDao(crypter, dbClient) {
		this.crypter = crypter;
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
						return callback(message, null);
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
						return callback(error, null);
					}
					else {
						return callback(null, "ok");
					}
				});
		});
	};

	return MongoDao;
})();
exports.MongoDao = MongoDao;
