'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('scrobbleAlong.services', []).

	factory('baseApi', ['$http', '$log', function($http, $log) {

		var apiServiceInstance = {
			getApiUrl: function(page, params, callback) {
				$http({ method: 'GET', url: '/api/' + page, params: params || {} }).
					success(function(data) {
						//$log.log("Success getting page " + page + ":", data);
						callback(data);
					}).
					error(function(data) {
						//$log.log("Error getting page " + page + ":", data);
						callback(null);
					});
			},

			postApiUrl: function(page, data, callback) {
				$http({ method: 'POST', url: '/api/' + page, data: data || {} }).
					success(function(response) {
						//$log.log("Success posting to page " + page + ":", data);
						callback(null, response);
					}).
					error(function(error) {
						//$log.log("Error posting to page " + page + ":", data);
						callback(error, null);
					});
			}
		};

		return apiServiceInstance;
	}]).

	factory('userDetails', ['baseApi', function(baseApi) {

		var apiServiceInstance = {

			getUserDbInfo: function(callback) {
				baseApi.getApiUrl('user-details', null, function(data) {
					if (data && data.username) {
						callback({
							lastfmUsername: data.username,
							listeningTo: data.listening,
							userScrobbles: data.scrobbles
						});
					}
					else {
						callback({
							lastfmUsername: null,
							listeningTo: null,
							userScrobbles: {}
						});
					}
				});
			},

			getUserLfmInfo: function(username, callback) {
				baseApi.getApiUrl('user-lastfm-info', { user: username }, function(data) {
					if (data) {
						callback(data);
					}
					else {
						callback(null);
					}
				});
			}
		};

		return apiServiceInstance;
	}]).

	factory('stationDetails', ['baseApi', function(baseApi) {

		var getApiBatch = function(batchSize, url, stationNames, username, details, callback) {
			if (stationNames.length == 0) {
				callback();
				return;
			}

			var batch = stationNames.splice(0, batchSize);
			var params = { stations: batch.join(",") };
			if (username) {
				params['user'] = username;
			}

			baseApi.getApiUrl(url, params, function(data) {
				angular.extend(details, data);
				getApiBatch(batchSize, url, stationNames, username, details, callback);
			});
		};

		var apiServiceInstance = {

			// Returns an array of station details in the callback
			getAllStationsDbInfo: function(callback) {
				baseApi.getApiUrl('stations', null, function(data) {
					callback(data || []);
				});
			},

			// Returns a map of station name to last.fm details (profile pic) in the callback
			getStationsLfmInfo: function(stationNames, callback) {
				if (!stationNames || stationNames.length == 0) {
					callback({});
				}

				stationNames = stationNames.slice(0); // Clone array so we can splice it safely
				var details = {};
				getApiBatch(10, 'station-lastfm-info', stationNames, null, details, function() {
					callback(details);
				});
			},

			// Returns a map of station name to tasteometer scores in the callback
			getStationsTasteometer: function(stationNames, username, callback) {
				if (!stationNames || stationNames.length == 0 || !username) {
					callback({});
				}

				stationNames = stationNames.slice(0); // Clone array so we can splice it safely
				var details = {};
				getApiBatch(10, 'station-lastfm-tasteometer', stationNames, username, details, function() {
					callback(details);
				});
			},

			// Returns a map of station name to recent track array in the callback
			getStationsRecentTracks: function(stationNames, callback) {
				if (!stationNames || stationNames.length == 0) {
					callback({});
				}

				stationNames = stationNames.slice(0); // Clone array so we can splice it safely
				var details = {};
				getApiBatch(5, 'station-lastfm-recenttracks', stationNames, null, details, function() {
					callback(details);
				});
			}
		};

		return apiServiceInstance;
	}]).

	factory('userManagement', ['baseApi', function(baseApi) {

		var apiServiceInstance = {
			getLoginUrl: function(callback) {
				baseApi.getApiUrl('login-url', null, function(data) {
					if (data && data.loginUrl) {
						callback(data.loginUrl);
					}
					else {
						callback('#');
					}
				});
			},

			stopScrobbling: function(stationUsername, callback) {
				baseApi.postApiUrl('stop-scrobbling', {}, callback);
			},

			scrobbleAlong: function(stationUsername, callback) {
				baseApi.postApiUrl('scrobble-along', { username: stationUsername }, callback);
			}
		};

		return apiServiceInstance;
	}]).

	factory('adminInfo', ['baseApi', function(baseApi) {

		var apiServiceInstance = {
			getAllUsers: function(callback) {
				baseApi.getApiUrl('admin/users', {}, callback);
			},

			getAllStations: function(callback) {
				baseApi.getApiUrl('admin/stations', {}, callback);
			},

			addStation: function(station, callback) {
				baseApi.postApiUrl('admin/add-station', { station: station }, callback);
			},

			updateStation: function(station, callback) {
				baseApi.postApiUrl('admin/update-station', { station: station }, callback);
			},

			clearUserListening: function(username, callback) {
				baseApi.postApiUrl('admin/clear-listening', { username: username }, callback);
			},

			clearUserSession: function(username, callback) {
				baseApi.postApiUrl('admin/clear-session', { username: username }, callback);
			}
		};

		return apiServiceInstance;
	}]);