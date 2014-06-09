'use strict';

// Declare app level module which depends on filters, and services

angular.module('scrobbleAlong', [
	'scrobbleAlong.controllers',
	//'scrobbleAlong.filters',
	'scrobbleAlong.services',
	'scrobbleAlong.directives',
	'ngCookies',
	'ngAnimate'
]).
config(function ($locationProvider) {
	$locationProvider.html5Mode(true);
});
