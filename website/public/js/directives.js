'use strict';

/* Directives */

angular.module('scrobbleAlong.directives', []).
	directive('appVersion', function (version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		};
	});
