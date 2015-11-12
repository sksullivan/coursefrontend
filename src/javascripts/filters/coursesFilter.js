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
		.filter('ActiveSectionsFilter', ['AgendaModelService', ActiveSectionsFilter]);

		function ActiveSectionsFilter (AgendaModelService) {
			return function(courses) {
				var activeSections = [];
				console.log("calling ActiveSectionsFilter");
				angular.forEach(courses, function (course) {
					if (AgendaModelService.activeCourses[course.shortName] !== undefined) {
						var courseRecord = AgendaModelService.activeCourses[course.shortName];
						for (var property in courseRecord) {
							if (courseRecord.hasOwnProperty(property) && AgendaModelService.isNumeric(property)) {
								console.log(property);
								activeSections.push(property);
							}
						}
					}
				});
				return activeSections;
			};
		}
})();