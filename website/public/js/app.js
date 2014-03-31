'use strict';

// Declare app level module which depends on filters, and services

angular.module('scrobbleAlong', [
	'scrobbleAlong.controllers',
	'scrobbleAlong.filters',
	'scrobbleAlong.services',
	'scrobbleAlong.directives',
	'ngCookies'
]).
config(function ($locationProvider) {
	//todo is this needed?
	$locationProvider.html5Mode(true);
});
