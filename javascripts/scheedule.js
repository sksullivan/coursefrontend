(function () {
    "use strict";

    var scheedule = angular.module('scheedule', ['ngResource','ngRoute','ui.bootstrap', 'angular-chartist', 'angular.filter']);
    console.log("Initialized Scheedule2 Angular.js application.");

    scheedule.config(function ($routeProvider,$locationProvider) {
        $locationProvider.html5Mode(false);

        $routeProvider
            .when('/', {
                redirectTo  : '/index'
            })
            .when('/index', {
                templateUrl : '/views/index.html',
                controller  : 'IndexController',
                controllerAs: 'index'
            })
            .when('/schedule-viewer', {
                templateUrl : '/views/schedule-viewer.html',
                controller  : 'ScheduleViewerController',
                controllerAs: 'viewer'
            })
            .when('/manual-builder', {
                templateUrl : '/views/manual-builder.html',
                controller  : 'ManualBuilderController',
                controllerAs: 'mb'
            })
            .when('/auto-builder', {
                templateUrl : '/views/auto-builder.html',
                controller  : 'AutoBuilderController',
                controllerAs: 'ab'
            });
    });
})();