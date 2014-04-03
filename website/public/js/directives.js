'use strict';

/* Directives */

angular.module('scrobbleAlong.directives', []).

	directive('appVersion', function (version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		};
	}).

	directive('stationTile', function () {
		return {
			templateUrl: 'templates/station-tile.html'
		};
	}).

	directive('userTile', function () {
		return {
			templateUrl: 'templates/user-tile.html'
		};
	})
;
