
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

	return MongoDao;
})();
exports.MongoDao = MongoDao;
