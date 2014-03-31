'use strict';

/* Controllers */

angular.module('scrobbleAlong.controllers', []).

	controller('MenuCtrl', function($scope, $http, $cookies) {
		$scope.loggedIn = $cookies.lastfmSession ? true : false;

		$http({ method: 'GET', url: '/api/login-url' }).
			success(function(data, status, headers, config) {
				//todo if status == 404 ...
				$scope.loginUrl = data.loginUrl;
			}).
			error(function(data, status, headers, config) {
				//todo
			});
	}).

	controller('IndexCtrl', function ($scope, $http, $cookies, $interval) {
		$scope.loggedIn = $cookies.lastfmSession ? true : false;
		$scope.stations = [];

		var updateStationLastfmInfo = function() {
			var chunkSize = 5;
			var stationChunks = [];
			for (var start=0; start < $scope.stations.length; start += chunkSize) {
				stationChunks.push($scope.stations.slice(start, start + chunkSize));
			}

			angular.forEach(stationChunks, function(stationChunk) {
				var stationNames = '';
				angular.forEach(stationChunk, function(station) {
					stationNames += station.lastfmUsername + ",";
				});
				stationNames = stationNames.slice(0, -1);

				$http({ method: 'GET', url: '/api/station-lastfm-info', params:{ stations: stationNames } }).
					success(function(data, status, headers, config) {
						//todo if status == 404 ...
						angular.forEach($scope.stations, function(station) {
							if (data[station.lastfmUsername]) {
								angular.extend(station, data[station.lastfmUsername]);
							}
						});
					}).
					error(function(data, status, headers, config) {
						//todo
					});

				if ($scope.lastfmUsername) {
					$http({ method: 'GET', url: '/api/station-lastfm-tasteometer', params:{ user: $scope.lastfmUsername, stations: stationNames } }).
						success(function(data, status, headers, config) {
							//todo if status == 404 ...
							angular.forEach($scope.stations, function(station) {
								if (data[station.lastfmUsername]) {
									station.tasteometer = data[station.lastfmUsername];
								}
							});
						}).
						error(function(data, status, headers, config) {
							//todo
						});
				}
			});
		}

		var updateStationLastfmRecentTracks = function() {
			var chunkSize = 5;
			var stationChunks = [];
			for (var start=0; start < $scope.stations.length; start += chunkSize) {
				stationChunks.push($scope.stations.slice(start, start + chunkSize));
			}

			angular.forEach(stationChunks, function(stationChunk) {
				var stationNames = '';
				angular.forEach(stationChunk, function(station) {
					stationNames += station.lastfmUsername + ",";
				});
				stationNames = stationNames.slice(0, -1);

				$http({ method: 'GET', url: '/api/station-lastfm-recenttracks', params:{ stations: stationNames } }).
					success(function(data, status, headers, config) {
						//todo if status == 404 ...
						angular.forEach($scope.stations, function(station) {
							if (data[station.lastfmUsername]) {
								station.recentTracks = data[station.lastfmUsername];
							}
						});
					}).
					error(function(data, status, headers, config) {
						//todo
					});
			});
		}
		$interval(updateStationLastfmRecentTracks, 20 * 1000);

		var updateUserLastfmInfo = function() {
			if (!$scope.lastfmUsername) {
				return;
			}

			$http({ method: 'GET', url: '/api/user-lastfm-info', params:{user: $scope.lastfmUsername} }).
				success(function(data, status, headers, config) {
					//todo if status == 404 ...
					$scope.lastfmProfileImage = data.lastfmProfileImage;
				}).
				error(function(data, status, headers, config) {
					//todo
				});
		}

		$scope.sortStationsBy = 'lastfmUsername';
		$scope.sortStations = function(station) {
			if ($scope.sortStationsBy == 'scrobbles') {
				return $scope.userScrobbles[station.lastfmUsername] * -1;
			}
			else if ($scope.sortStationsBy == 'compatibility') {
				return station.tasteometer * -1;
			}
			else {
				return station.lastfmUsername;
			}
		};

		$scope.notListening = function(station) {
			return station.lastfmUsername != $scope.listeningTo;
		};

		if ($scope.loggedIn) {
			$http({ method: 'GET', url: '/api/user-details' }).
				success(function(data, status, headers, config) {
					//todo if status == 404 ...
					$scope.lastfmUsername = data.username;
					$scope.listeningTo = data.listening;
					$scope.userScrobbles = data.scrobbles;
					updateUserLastfmInfo();

					//todo handle this using a service?
					//todo remove duplication
					$http({ method: 'GET', url: '/api/stations' }).
						success(function(stations, status, headers, config) {
							//todo if status == 404 ...
							$scope.stations = stations;
							updateStationLastfmInfo();
							updateStationLastfmRecentTracks();
						}).
						error(function(data, status, headers, config) {
							//todo
						});
				}).
				error(function(data, status, headers, config) {
					//todo
				});
		}
		else {
			$http({ method: 'GET', url: '/api/login-url' }).
				success(function(data, status, headers, config) {
					//todo if status == 404 ...
					$scope.loginUrl = data.loginUrl;

					//todo handle this using a service?
					//todo remove duplication
					$http({ method: 'GET', url: '/api/stations' }).
						success(function(stations, status, headers, config) {
							//todo if status == 404 ...
							$scope.stations = stations;
							updateStationLastfmInfo();
							updateStationLastfmRecentTracks();
						}).
						error(function(data, status, headers, config) {
							//todo
						});
				}).
				error(function(data, status, headers, config) {
					//todo
				});
		}
	}).

	controller('AdminCtrl', function($scope, $cookies) {
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
	});
