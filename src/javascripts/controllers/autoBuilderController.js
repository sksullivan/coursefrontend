(function () {
	"use strict";

	angular
		.module('scheedule')
		.controller('AutoBuilderController', ['$scope','$rootScope','$filter','CourseDataService', AutoBuilderController]);

	/* @ngInject */
	function AutoBuilderController ($scope, $rootScope, $filter, CourseDataService) {
	    var ab = this;
	    ab.init = function () {
	    	console.log("Loaded auto builder controller.");
            ab.courses = [];
            ab.hideBars();
            ab.selectedCourses = [];
            ab.min = 0;
            ab.max = 100;

            // Load courses form Course Data Service
            CourseDataService.getCourses(function (someCourses) {
                console.log("PROCESSING Courses");
                /*$scope.$apply(function() {
                    for (var course of someCourses) {
                        ab.courses.push(course);
                    }
                });*/
                ab.courses = someCourses;
            }, function (err) {
                console.log("Couldn't load course data from backend.");
                console.log(err);
                mb.showError("Couldn't load course data form backend.",err);
            });
        };

        ab.addCourse = function (selectedCourse) {
            ab.courses = ab.courses.filter(function(e) {
                return selectedCourse.shortName != e["shortName"];
            });
            ab.selectedCourses.push(selectedCourse);
        };

        ab.removeCourse = function (selectedCourse) {
            ab.selectedCourses = ab.selectedCourses.filter(function(e) {
                return selectedCourse.shortName != e["shortName"];
            });
            ab.courses.push(selectedCourse);
        };

        ab.generateSchedules = function () {
            $("#loading").fadeIn();
            $("#finish").fadeIn();
        };

        ab.showBar = function (name) {
            $('#'+name).fadeIn(); 
        };

        ab.closeBar = function (name) {
            $('#'+name).fadeOut();
        };

        ab.hideBars = function () {
            $("#loading").hide();
            $("#finish").hide();
        }

	    ab.init();
	}
})();
