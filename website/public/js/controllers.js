'use strict';

/* Controllers */

angular.module('scrobbleAlong.controllers', []).

	controller('MenuCtrl', function ($scope) {
		$scope.loggedIn = false;
	}).

	controller('IndexCtrl', function ($scope, $http) {
		$http({
			method: 'GET',
			url: '/api/name'
		}).
			success(function (data, status, headers, config) {
				$scope.name = data.name;
			}).
			error(function (data, status, headers, config) {
				$scope.name = 'Error!';
			});
	}).

	controller('AdminCtrl', function ($scope) {
		// write Ctrl here
		$scope.adminName = "Admin Bob";
	});
