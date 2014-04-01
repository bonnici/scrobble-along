'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('scrobbleAlong.services', []).
	value('version', '0.1').

	factory('api', ['$http', '$log', function($http, $log) {

		var getApiUrl = function(page, params, callback) {
			$http({ method: 'GET', url: '/api/' + page, params: params || {} }).
				success(function(data) {
					//$log.log("Success getting page " + page + ":", data);
					callback(data);
				}).
				error(function(data) {
					//$log.log("Error getting page " + page + ":", data);
					callback(null);
				});
		};

		var apiServiceInstance = {
			getLoginUrl: function(callback) {
				getApiUrl('login-url', null, function(data) {
					if (data && data.loginUrl) {
						callback(data.loginUrl);
					}
					else {
						callback('#');
					}
				});
			},

			getUserDetails: function(callback) {
				getApiUrl('user-details', null, function(data) {
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

			getUserLastfmInfo: function(username, callback) {
				getApiUrl('user-lastfm-info', { user: username }, function(data) {
					if (data) {
						callback(data);
					}
					else {
						callback(null);
					}
				});
			},

			getStationDetails: function(callback) {
				getApiUrl('stations', null, function(data) {
					callback(data || []);
				});
			},

			getStationLastfmInfo: function(stationUsername, callback) {
				getApiUrl('station-lastfm-info', { stations: [stationUsername] }, function(data) {
					if (data && data[stationUsername]) {
						callback(data[stationUsername]);
					}
					else {
						callback(null);
					}
				});
			},

			getStationTasteometer: function(stationUsername, username, callback) {
				var params = { user: username, stations: [stationUsername] };
				getApiUrl('station-lastfm-tasteometer', params, function(data) {
					if (data && data[stationUsername]) {
						callback(data[stationUsername]);
					}
					else {
						callback(0);
					}
				});
			},

			getStationRecentTracks: function(stationUsername, callback) {
				getApiUrl('station-lastfm-recenttracks', { stations: [stationUsername] }, function(data) {
					if (data && data[stationUsername]) {
						callback(data[stationUsername]);
					}
					else {
						callback(null);
					}
				});
			}
		};

		return apiServiceInstance;
	}]);