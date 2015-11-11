(function () {
	"use strict";

	angular
		.module('scheedule')
		.filter('ActiveCoursesFilter', ['AgendaModelService', ActiveCoursesFilter]);

		function ActiveCoursesFilter (AgendaModelService) {
			return function(courses) {
				var activeCourses = [];
				angular.forEach(courses, function (course) {
					if (AgendaModelService.activeCourses[course.shortName] !== undefined) {
						activeCourses.push(course);
						// console.log("GOT COURSE");
					} else {
						// console.log("NOT COURSE");
					}
				});
				return activeCourses;
			};
		}
})();