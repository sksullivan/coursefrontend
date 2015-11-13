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
					}
				});
				return activeCourses;
			};
		}
})();

(function () {
	"use strict";

	angular
		.module('scheedule')
		.filter('ActiveCRNFilter', ['AgendaModelService', ActiveCRNFilter]);

		function ActiveCRNFilter (AgendaModelService) {
			return function(courses) {
				console.log(AgendaModelService.activeCourses);
				var activeSections = [];
				angular.forEach(courses, function (course) {
					if (AgendaModelService.activeCourses[course.shortName] !== undefined) {
						var courseRecord = AgendaModelService.activeCourses[course.shortName];
						for (var property in courseRecord) {
							if (courseRecord.hasOwnProperty(property) && AgendaModelService.isNumeric(property)) {
								if (courseRecord[property] !== undefined) {
									activeSections.push(property);
								}
							}
						}
					}
				});
				console.log(activeSections);
				return activeSections;
			};
		}
})();