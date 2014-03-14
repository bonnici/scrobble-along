/// <reference path="../definitions/DefinitelyTyped/mongodb/mongodb.d.ts"/>
/// <reference path="../definitions/DefinitelyTyped/underscore/underscore.d.ts"/>
/// <reference path="../definitions/typescript-node-definitions/winston.d.ts"/>

import crypt = require("./Crypter");
import u = require("./User");

import _ = require("underscore");
import mongodb = require("mongodb");
import winston = require("winston");

export interface UserDao {
	getUsersListeningToStation(station:string, callback:(err, users:u.User[]) => void): void;
}

export class DummyUserDao implements UserDao {
	getUsersListeningToStation(station:string, callback:(err, users:u.User[]) => void): void {
		if (station == "Station1") {
			return callback(null, [
				{ UserName: "User1", Session: "" },
				{ UserName: "User2", Session: "" },
				{ UserName: "User3", Session: "" }
			]);
		}
		else {
			return callback(null, [
				{ UserName: "User2", Session: "" }
			]);
		}
	}
}

export class MongoUserDao implements UserDao {

	constructor (private dbClient: mongodb.Db, private crypter: crypt.Crypter) { }

	getUsersListeningToStation(station:string, callback:(err, users:u.User[]) => void): void {
		if (!this.dbClient || !this.crypter) {
			callback("Invalid DAO setup", null);
			return;
		}

		this.dbClient.collection('user', (error, collection) => {
			if (error) {
				callback(error, null);
				return;
			}

			//todo test the find
			collection.find({ listening: station }).toArray((err, results) => { 
				if (err) {
					callback(error, null);
					return;
				}

				var users = [];
				_.each(results, (record:any) => {
					if (!record._id || !record.session) {
						winston.error("Invalid user record found in DB:", record);
					}
					else {
						var user = { UserName: record._id, Session: this.crypter.decrypt(record.session) };
						winston.info("Found user listening to " + station + ":", user.UserName);
						users.push(user);
					}
				});
				callback(null, users);
			});
		});
	}
}