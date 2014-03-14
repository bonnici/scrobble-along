/// <reference path="../definitions/DefinitelyTyped/mongodb/mongodb.d.ts"/>
/// <reference path="../definitions/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../definitions/typescript-node-definitions/winston.d.ts"/>



var _ = require("underscore");

var winston = require("winston");

var DummyUserDao = (function () {
    function DummyUserDao() {
    }
    DummyUserDao.prototype.getUsersListeningToStation = function (station, callback) {
        if (station == "Station1") {
            return callback(null, [
                { UserName: "User1", Session: "" },
                { UserName: "User2", Session: "" },
                { UserName: "User3", Session: "" }
            ]);
        } else {
            return callback(null, [
                { UserName: "User2", Session: "" }
            ]);
        }
    };
    return DummyUserDao;
})();
exports.DummyUserDao = DummyUserDao;

var MongoUserDao = (function () {
    function MongoUserDao(dbClient, crypter) {
        this.dbClient = dbClient;
        this.crypter = crypter;
    }
    MongoUserDao.prototype.getUsersListeningToStation = function (station, callback) {
        var _this = this;
        if (!this.dbClient || !this.crypter) {
            callback("Invalid DAO setup", null);
            return;
        }

        this.dbClient.collection('user', function (error, collection) {
            if (error) {
                callback(error, null);
                return;
            }

            //todo test the find
            collection.find({ listening: station }).toArray(function (err, results) {
                if (err) {
                    callback(error, null);
                    return;
                }

                var users = [];
                _.each(results, function (record) {
                    if (!record._id || !record.session) {
                        winston.error("Invalid user record found in DB:", record);
                    } else {
                        var user = { UserName: record._id, Session: _this.crypter.decrypt(record.session) };
                        winston.info("Found user listening to " + station + ":", user.UserName);
                        users.push(user);
                    }
                });
                callback(null, users);
            });
        });
    };
    return MongoUserDao;
})();
exports.MongoUserDao = MongoUserDao;

//# sourceMappingURL=UserDao.js.map
