'use strict';

/* Controllers */

angular.module('scrobbleAlong.controllers', []).

	controller('MenuCtrl', ['$scope', '$cookies', 'api', function($scope, $cookies, api) {
		$scope.loggedIn = $cookies.lastfmSession ? true : false;

		api.getLoginUrl(function(url) {
			$scope.loginUrl = url;
		});
	}]).

	controller('IndexCtrl', ['$scope', '$http', '$cookies', '$interval', 'api',
		function ($scope, $http, $cookies, $interval, api) {

		$scope.loggedIn = $cookies.lastfmSession ? true : false;

		//todo use MenuCtrl scope somehow?
		api.getLoginUrl(function(url) {
			$scope.loginUrl = url;
		});

		//todo change this to use promises?
		api.getUserDetails(function(userDetails) {
			$scope.userDetails = { lastfmUsername: userDetails.lastfmUsername };
			var userListeningTo = userDetails.listeningTo;
			var userScrobbles = userDetails.userScrobbles;

			if ($scope.userDetails.lastfmUsername) {
				api.getUserLastfmInfo($scope.userDetails.lastfmUsername, function(userInfo) {
					$scope.userDetails.lastfmProfileImage = userInfo.lastfmProfileImage;
				});
			}

			api.getStationDetails(function(stationDetails) {
				$scope.stations = stationDetails;

				angular.forEach($scope.stations, function(station) {
					station.userScrobbles = userScrobbles[station.lastfmUsername] || 0;
					station.tasteometer = 0; // Initial setting so sorting works while the page is loading
					station.currentlyScrobbling = false;

					if (station.lastfmUsername == userListeningTo) {
						station.currentlyScrobbling = true;
					}

					api.getStationLastfmInfo(station.lastfmUsername, function(stationLastfmInfo) {
						angular.extend(station, stationLastfmInfo);
					});

					if ($scope.userDetails.lastfmUsername) {
						api.getStationTasteometer(station.lastfmUsername, $scope.userDetails.lastfmUsername, function(tasteometer) {
							station.tasteometer = tasteometer;
						});
					}

					api.getStationRecentTracks(station.lastfmUsername, function(recentTracks) {
						if (recentTracks) {
							station.recentTracks = recentTracks;
						}
					});
				});
			});
		});

		// Update recent tracks every 20 seconds
		$interval(function() {
			angular.forEach($scope.stations, function(station) {
				api.getStationRecentTracks(station.lastfmUsername, function(recentTracks) {
					station.recentTracks = recentTracks;
				});
			});
		}, 200 * 1000);
		//todo change this to 20 seconds

		// Sorting of stations
		$scope.sortStationsBy = 'lastfmUsername';
		$scope.sortStations = function(station) {
			if ($scope.sortStationsBy == 'scrobbles') {
				return station.userScrobbles * -1;
			}
			else if ($scope.sortStationsBy == 'compatibility') {
				return station.tasteometer * -1;
			}
			else {
				return station.lastfmUsername;
			}
		};

		var setCurrentlyScrobbling = function(scrobblingStation) {
			angular.forEach($scope.stations, function(curStation) {
				curStation.currentlyScrobbling = (curStation == scrobblingStation);
			});
		}

		$scope.stopScrobbling = function(station) {
			if (station && station.lastfmUsername) {
				api.stopScrobbling(station.lastfmUsername, function(err, status) {
					if (status) {
						setCurrentlyScrobbling(null);
					}
					else {
						//todo error message
						alert("Error stopping scrobble: " + err);
					}
				});
			}
		};
		$scope.scrobbleAlong = function(station) {
			if (station && station.lastfmUsername) {
				api.scrobbleAlong(station.lastfmUsername, function(err, status) {
					if (status) {
						setCurrentlyScrobbling(station);
					}
					else {
						//todo error message
						alert("Error scrobbling along: " + err);
					}
				});
			}
		};
	}]).

	controller('AdminCtrl', ['$scope', '$cookies', function($scope, $cookies) {
		// write Ctrl here
		$scope.adminName = "Admin Bob";
		/*

		if ($cookies.lastfmSession) {
			delete $cookies.lastfmSession;
		}
		else {
			$cookies.lastfmSession = "test-session";
		}
		*/
	}]);
