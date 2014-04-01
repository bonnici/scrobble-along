'use strict';

/* Controllers */

angular.module('scrobbleAlong.controllers', []).

	controller('MenuCtrl', ['$scope', '$cookies', 'api', function($scope, $cookies, api) {
		$scope.loggedIn = $cookies.lastfmSession ? true : false;

		api.getLoginUrl(function(url) {
			$scope.loginUrl = url;
		});
	}]).

	controller('IndexCtrl', ['$scope', '$http', '$cookies', '$interval', 'api', function ($scope, $http, $cookies, $interval, api) {

		$scope.loggedIn = $cookies.lastfmSession ? true : false;

		//todo use MenuCtrl scope somehow?
		api.getLoginUrl(function(url) {
			$scope.loginUrl = url;
		});

		//todo change this to use promises?
		api.getUserDetails(function(userDetails) {
			$scope.userDetails = userDetails;

			if ($scope.userDetails.lastfmUsername) {
				api.getUserLastfmInfo($scope.userDetails.lastfmUsername, function(userInfo) {
					$scope.userDetails.lastfmProfileImage = userInfo.lastfmProfileImage;
				});
			}

			api.getStationDetails(function(stationDetails) {
				$scope.stations = stationDetails;

				angular.forEach($scope.stations, function(station) {
					station.userScrobbles = $scope.userDetails.userScrobbles[station.lastfmUsername];
					station.tasteometer = 0; // Initial setting so sorting works while the page is loading
					if (station.lastfmUsername == $scope.listeningTo) {
						$scope.scrobblingStation = station;
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
		}, 20 * 1000);

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

		// Filter to hide the now playing station from the main list
		$scope.notListening = function(station) {
			return !$scope.userDetails || station.lastfmUsername != $scope.userDetails.listeningTo;
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
