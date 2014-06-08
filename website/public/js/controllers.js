'use strict';

/* Controllers */

angular.module('scrobbleAlong.controllers', []).

	controller('LoginCtrl', ['$scope', '$cookies', '$window', 'userManagement', function($scope, $cookies, $window, userManagement) {
		$scope.loggedIn = $cookies.lastfmSession ? true : false;
		$scope.userDetails = { isScrobbling: false };

		userManagement.getLoginUrl(function(url) {
			$scope.loginUrl = url;
		});

		$scope.login = function() {
			if ($scope.loginUrl) {
				$window.location.href = $scope.loginUrl;
			}
		}

		$scope.logoutModal = function() {
			if ($scope.userDetails.isScrobbling) {
				$('#logout-modal').modal();
			}
			else {
				$window.location.href = '/logout';
			}
		};
	}]).

	controller('IndexCtrl', ['$scope', '$timeout', 'userManagement', 'userDetails', 'stationDetails',
		function ($scope, $timeout, userManagement, userDetailsSvc, stationDetailsSvc) {

		$scope.stations = [];

		var updateStationsRecentTracks = function() {
			var stationNames = [];
			angular.forEach($scope.stations, function(station) {
				stationNames.push(station.lastfmUsername);
			});

			stationDetailsSvc.getStationsRecentTracks(stationNames, function(stationsRecentTracks) {
				if (stationsRecentTracks) {
					angular.forEach($scope.stations, function(station) {
						station.recentTracks = stationsRecentTracks[station.lastfmUsername];
					});
				}

				console.log("setting timeout");
				$timeout(function() { updateStationsRecentTracks(); }, 200 * 1000); //todo change this to 20
			});
		};

		userDetailsSvc.getUserDbInfo(function(userDetails) {
			$scope.userDetails.lastfmUsername = userDetails.lastfmUsername;
			var userListeningTo = userDetails.listeningTo;
			var userScrobbles = userDetails.userScrobbles || {};

			if ($scope.userDetails.lastfmUsername) {
				userDetailsSvc.getUserLfmInfo($scope.userDetails.lastfmUsername, function(userInfo) {
					if (userInfo && userInfo.lastfmProfileImage) {
						$scope.userDetails.lastfmProfileImage = userInfo.lastfmProfileImage;
					}
				});
			}

			stationDetailsSvc.getAllStationsDbInfo(function(stationDbInfo) {
				$scope.stations = stationDbInfo;

				var stationNames = [];
				angular.forEach($scope.stations, function(station) {
					stationNames.push(station.lastfmUsername);
					station.userScrobbles = userScrobbles[station.lastfmUsername] || 0;
					station.tasteometer = 0; // Initial setting so sorting works while the page is loading
					station.currentlyScrobbling = false;

					if (userListeningTo && station.lastfmUsername == userListeningTo) {
						station.currentlyScrobbling = true;
						$scope.userDetails.isScrobbling = true;
					}
				});

				stationDetailsSvc.getStationsLfmInfo(stationNames, function(stationsLfmInfo) {
					if (stationsLfmInfo) {
						angular.forEach($scope.stations, function(station) {
							angular.extend(station, stationsLfmInfo[station.lastfmUsername]);
						});
					}
				});

				stationDetailsSvc.getStationsTasteometer(stationNames, $scope.userDetails.lastfmUsername, function(stationsTasteometer) {
					if (stationsTasteometer) {
						angular.forEach($scope.stations, function(station) {
							station.tasteometer = stationsTasteometer[station.lastfmUsername] || 0;
						});
					}
				});

				updateStationsRecentTracks(); // Fires a timeout to re-update later
			});
		});

		// Sorting of stations
		$scope.changeStationSort = function(sort) {
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
				userManagement.stopScrobbling(station.lastfmUsername, function(err, status) {
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
				userManagement.scrobbleAlong(station.lastfmUsername, function(err, status) {
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

	controller('AdminCtrl', ['$scope', 'adminInfo', function($scope, adminInfo) {
		$scope.newStation = {};
		var updates = [];
		var addUpdate = function(update) {
			updates.push(update);
			$scope.updatesText = updates.join("\n");
		}

		var loadUsers = function() {
			adminInfo.getAllUsers(function(userDetails) {
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
			adminInfo.getAllStations(function(stationDetails) {
				$scope.stationDetails = stationDetails;
			});
		};

		loadUsers();
		loadStations();

		$scope.addStation = function() {
			adminInfo.addStation($scope.newStation, function(err, status) {
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
			adminInfo.updateStation(station, function(err, status) {
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
			adminInfo.clearUserListening(user['_id'], function(err, status) {
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
			adminInfo.clearUserSession(user['_id'], function(err, status) {
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
