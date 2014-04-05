'use strict';

/* Controllers */

angular.module('scrobbleAlong.controllers', []).

	controller('MenuCtrl', ['$scope', '$cookies', 'api', function($scope, $cookies, api) {
		$scope.loggedIn = $cookies.lastfmSession ? true : false;

		api.getLoginUrl(function(url) {
			$scope.loginUrl = url;
		});
	}]).

	controller('IndexCtrl', ['$scope', '$http', '$cookies', '$interval', '$timeout', 'api',
		function ($scope, $http, $cookies, $interval, $timeout, api) {

		// Updates the recent track names & images of a batch of stations and continues until all are loaded
		var updateStationRecentTracksBatch = function(stationNames, batchSize) {
			if (stationNames.length == 0) {
				console.log("Doen getting station recent tracks", new Date());
				return;
			}

			var batch = stationNames.splice(0, batchSize);

			console.log("Getting station recent tracks for a batch", new Date());
			api.getStationRecentTracks(batch, function(batchRecentTracks) {
				angular.forEach($scope.stations, function(station) {
					if (batchRecentTracks[station.lastfmUsername]) {
						station.recentTracks = batchRecentTracks[station.lastfmUsername];
					}
				});

				updateStationRecentTracksBatch(stationNames, batchSize);
			});
		};

		// Updates the recent track names & images of all stations
		var updateStationRecentTracks = function() {
			var stationNames = [];
			angular.forEach($scope.stations, function(station) {
				stationNames.push(station.lastfmUsername);
			});

			var batchSize = 10;
			updateStationRecentTracksBatch(stationNames, batchSize);
		};

		// Updates the profile pic and tasteometer of a batch of stations and continues on to the next batch.
		// Calls callback only when all batches are processed.
		var updateStationLastfmInfoBatch = function(stationNames, batchSize, callback) {
			if (stationNames.length == 0) {
				callback();
				return;
			}

			var batch = stationNames.splice(0, batchSize);

			console.log("Getting station last.fm details for a batch", new Date());
			api.getStationLastfmInfo(batch, $scope.userDetails.lastfmUsername, function(batchLastfmInfos) {
				angular.forEach($scope.stations, function(station) {
					if (batchLastfmInfos[station.lastfmUsername]) {
						angular.extend(station, batchLastfmInfos[station.lastfmUsername]);
					}
				});

				updateStationLastfmInfoBatch(stationNames, batchSize, callback);
			});
		};

		// Updates the profile pic/tasteometer of all stations then starts updating the recent tracks
		var updateStationLastfmInfo = function() {
			var stationNames = [];
			angular.forEach($scope.stations, function(station) {
				stationNames.push(station.lastfmUsername);
			});

			var batchSize = 10;
			updateStationLastfmInfoBatch(stationNames, batchSize, function() {
				updateStationRecentTracks();

				// Update recent tracks every 20 seconds
				$interval(updateStationRecentTracks, 20 * 1000);
			});
		};

		$scope.loggedIn = $cookies.lastfmSession ? true : false;

		//todo use MenuCtrl scope somehow?
		api.getLoginUrl(function(url) {
			$scope.loginUrl = url;
		});

		//todo change this to use promises?
		console.log("Getting user details", new Date());
		api.getUserDetails(function(userDetails) {
			$scope.userDetails = { lastfmUsername: userDetails.lastfmUsername };
			var userListeningTo = userDetails.listeningTo;
			var userScrobbles = userDetails.userScrobbles;

			if ($scope.userDetails.lastfmUsername) {
				api.getUserLastfmInfo($scope.userDetails.lastfmUsername, function(userInfo) {
					if (userInfo.lastfmProfileImage) {
						$scope.userDetails.lastfmProfileImage = userInfo.lastfmProfileImage;
					}
				});
			}

			console.log("Getting station details", new Date());
			api.getStationDetails(function(stationDetails) {
				$scope.stations = stationDetails;

				angular.forEach($scope.stations, function(station) {
					station.userScrobbles = userScrobbles[station.lastfmUsername] || 0;
					station.tasteometer = 0; // Initial setting so sorting works while the page is loading
					station.currentlyScrobbling = false;

					if (station.lastfmUsername == userListeningTo) {
						station.currentlyScrobbling = true;
					}
				});

				updateStationLastfmInfo();
			});
		});

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
