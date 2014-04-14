'use strict';

/* Controllers */

angular.module('scrobbleAlong.controllers', []).

	controller('LoginCtrl', ['$scope', '$cookies', '$window', 'api', function($scope, $cookies, $window, api) {
		$scope.loggedIn = $cookies.lastfmSession ? true : false;
		$scope.userDetails = { isScrobbling: false };

		api.getLoginUrl(function(url) {
			$scope.loginUrl = url;
		});

		$scope.login = function() {
			if ($scope.loginUrl) {
				$window.location.href = $scope.loginUrl;
			}
		}

		$scope.logoutModal = function() {
			if ($scope.userDetails.isScrobbling) {
				//$window.alert("modal here");
				$('#logout-modal').modal();
			}
			else {
				$window.location.href = '/logout';
			}
		};
	}]).

	controller('IndexCtrl', ['$scope', '$http', '$cookies', '$interval', '$timeout', 'api',
		function ($scope, $http, $cookies, $interval, $timeout, api) {

		$scope.stations = [];

		// Updates the recent track names & images of a batch of stations and continues until all are loaded
		var updateStationRecentTracksBatch = function(stationNames, batchSize) {
			if (stationNames.length == 0) {
				return;
			}

			var batch = stationNames.splice(0, batchSize);

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
				$interval(function() { updateStationRecentTracks(); }, 20 * 1000);
			});
		};


		//todo change this to use promises?
		api.getUserDetails(function(userDetails) {
			$scope.userDetails.lastfmUsername = userDetails.lastfmUsername;
			var userListeningTo = userDetails.listeningTo;
			var userScrobbles = userDetails.userScrobbles || {};

			if ($scope.userDetails.lastfmUsername) {
				api.getUserLastfmInfo($scope.userDetails.lastfmUsername, function(userInfo) {
					if (userInfo.lastfmProfileImage) {
						$scope.userDetails.lastfmProfileImage = userInfo.lastfmProfileImage;
					}
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
						$scope.userDetails.isScrobbling = true;
					}
				});

				updateStationLastfmInfo();
			});
		});

		// Sorting of stations
		$scope.changeStationSort = function(sort) {
			console.log("sortStationsBy", sort);
			$scope.sortStationsBy = sort;
		};
		$scope.sortStationsBy = $scope.loggedIn ? 'scrobbles' : 'lastfmUsername';
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
			$scope.userDetails.isScrobbling = false;
			angular.forEach($scope.stations, function(curStation) {
				if (curStation == scrobblingStation) {
					$scope.userDetails.isScrobbling = true;
					curStation.currentlyScrobbling = true;
				}
				else {
					curStation.currentlyScrobbling = false
				}
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

	controller('AdminCtrl', ['$scope', 'api', function($scope, api) {
		$scope.newStation = {};
		var updates = [];
		var addUpdate = function(update) {
			updates.push(update);
			$scope.updatesText = updates.join("\n");
		}

		var loadUsers = function() {
			api.getAllUsers(function(userDetails) {
				$scope.allUserDetails = userDetails;

				$scope.numUsers = 0;
				$scope.numUsersScrobbling = 0;
				angular.forEach($scope.allUserDetails, function(user) {
					$scope.numUsers++;
					if (user.listening) {
						$scope.numUsersScrobbling++;
					}
				});
			});
		};

		var loadStations = function() {
			api.getAllStations(function(stationDetails) {
				$scope.stationDetails = stationDetails;
			});
		};

		loadUsers();
		loadStations();

		$scope.addStation = function() {
			api.addStation($scope.newStation, function(err, status) {
				if (err) {
					addUpdate("Error adding station " + $scope.newStation['_id'] + ": " + err);
				}
				else {
					addUpdate("Added station " + $scope.newStation['_id']);
				}
				$scope.newStation = {};
				loadStations();
			});
		};

		$scope.updateStation = function(station) {
			api.updateStation(station, function(err, status) {
				if (err) {
					addUpdate("Error updating station " + station['_id'] + ": " + err);
				}
				else {
					addUpdate("Updated station " + station['_id']);
				}
				loadStations();
			});
		};

		$scope.clearUserListening = function(user, reload, callback) {
			api.clearUserListening(user['_id'], function(err, status) {
				if (err) {
					addUpdate(err);
				}
				else {
					addUpdate("Cleared user " + user['_id'] + " listening");
				}

				if (reload) {
					loadUsers();
				}

				if (callback) {
					callback(err, status);
				}
			});
		};

		$scope.clearUserSession = function(user, reload, callback) {
			api.clearUserSession(user['_id'], function(err, status) {
				if (err) {
					addUpdate(err);
				}
				else {
					addUpdate("Cleared user " + user['_id'] + " session");
				}

				if (reload) {
					loadUsers();
				}

				if (callback) {
					callback(err, status);
				}
			});
		};

		var doClearAllUserListening = function(userDetails, callback) {
			if (!userDetails || userDetails.length == 0) {
				callback();
				return;
			}
			else {
				var singleUser = userDetails.splice(0, 1);
				if (singleUser[0].listening) {
					$scope.clearUserListening(singleUser[0], false, function() {
						doClearAllUserListening(userDetails, callback);
					});
				}
				else {
					doClearAllUserListening(userDetails, callback);
				}
			}
		};

		$scope.clearAllUserListening = function() {
			var userDetails = $scope.allUserDetails.slice(0);
			doClearAllUserListening(userDetails, function() {
				loadUsers();
			});
		};

		var doClearAllUserSessions = function(userDetails, callback) {
			if (!userDetails || userDetails.length == 0) {
				callback();
				return;
			}
			else {
				var singleUser = userDetails.splice(0, 1);
				if (singleUser[0].session) {
					$scope.clearUserSession(singleUser[0], false, function() {
						doClearAllUserSessions(userDetails, callback);
					});
				}
				else {
					doClearAllUserSessions(userDetails, callback);
				}
			}
		};

		$scope.clearAllUserSessions = function() {
			var userDetails = $scope.allUserDetails.slice(0);
			doClearAllUserSessions(userDetails, function() {
				loadUsers();
			});
		};

		$scope.sortStations = function(station) {
			return station['_id'];
		};

		$scope.sortUsers = function(user) {
			return user.listening;
		};

	}]);
