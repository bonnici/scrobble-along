'use strict';

/* Directives */

angular.module('scrobbleAlong.directives', []).

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
