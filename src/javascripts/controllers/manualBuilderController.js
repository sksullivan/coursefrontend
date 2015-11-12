(function () {
	"use strict";

	angular
		.module('scheedule')
		.controller('ManualBuilderController', ['$rootScope','$filter','AuthService','CourseDataService', 'AgendaService', ManualBuilderController]);

	// Manual Agenda Builder Controller
	// ----------------
	//
	// Coordinates creating of agenda view, course selection accordions,
	// course searching and agenda/accordion interactions.
	function ManualBuilderController ($rootScope, $filter, AuthService, CourseDataService, AgendaService) {
		var mb = this;
		mb.init = function () {
			console.log("Loaded manual builder controller.");
			mb.courses = [];

			// Load courses from Course Data Service.
			CourseDataService.getCourses(function (someCourses) {
				for (var course of someCourses) {
					mb.courses.push(course);
				}
			}, function (err) {
				console.log("Couldn't load course data from backend.");
			});

			$rootScope.$on('saveSchedule', function () {
				mb.openDialog("save-dialog");
			});

			$rootScope.$on('loadSchedules', function () {
				mb.loadSchedules();
			});

			$rootScope.$on('presentLoginModal', function () {
				mb.openDialog("login-dialog");
			});

			// Initialize blank agenda.
			mb.agenda = AgendaService.blankAgenda();
		};

		// Fired upon clicking a section.
		mb.clickSection = function (section) {
			if (section.active) {
				// If we're clicking a selected section, clear its active flag.
				// Then remove it from the calendar, and return it to the
				// mouseentered state.
				section.active = false;
				mb.agenda.removeSeriesForSection(section);
				mb.highlightSection(section);
			} else {
				// If we clicked an unselected section, exit the mouseentered
				// state. Set its active flag and add it to the agenda.
				mb.unhighlightSection(section);
				section.active = true;
				mb.agenda.addNormalSeriesForSection(section);
			}
		};

		// Fired when the mosueenter event occurs on a section.
		mb.highlightSection = function (section) {
			// Only add the translucent hover section to the agenda if the section
			// isn't already selected.
			if (!section.active) {
				section.hovering = true;
				mb.agenda.addHoverSeriesForSection(section);
			}
		};

		// Fired when the mosueleave event occurs on a section.
		mb.unhighlightSection = function (section) {
			// Only remove the hover section from the agenda if the section was
			// already being hovered over (i.e. prevent removing selected sections).
			if (section.hovering) {
				section.hovering = false;
				mb.agenda.removeSeriesForSection(section);
			}
		};

		mb.saveSchedule = function () {
			console.log("Saving schedule...");
			var CRNList = [];
			for (var section of $filter('ActiveSectionsFilter')(mb.courses)) {
				CRNList.push(section.id);
			}
			CourseDataService.saveSchedule(CRNList,mb.scheduleTitle,function () {
				console.log("Saved schedule.");
				mb.closeDialog("save-dialog");
			}, function (err) {
				console.log("Error saving schedule.");
				console.log(err);
			});
		};

		mb.loadSchedules = function () {
			console.log("Loading schedules...");
			CourseDataService.loadSchedules(function (schedules) {
				console.log("Loaded schedules.");
				console.log(schedules.data);
				mb.loadedSchedules = schedules.data;
				mb.openDialog("load-dialog");
			}, function (err) {
				console.log("Error loading schedules.");
				console.log(err);
			});
		};

		mb.displaySchedule = function () {
			console.log("displaying a thing");
			var scheduleList = document.getElementById("schedule-names");
			var CRNList = mb.loadedSchedules[mb.selectedScheduleIndex].CRNList;
			var activatedSections = [];
			for (var crnIndex = 0; crnIndex < CRNList.length; crnIndex++) {
				for (var courseIndex = 0; courseIndex < mb.courses.length; courseIndex++) {
					for (var sectionIndex = 0; sectionIndex < mb.courses[courseIndex].sections.length; sectionIndex++) {
						if (CRNList[crnIndex] == mb.courses[courseIndex].sections[sectionIndex].id && !activatedSections.includes(mb.courses[courseIndex].sections[sectionIndex])) {
							mb.agenda.addNormalSeriesForSection(mb.courses[courseIndex].sections[sectionIndex]);
							mb.courses[courseIndex].sections[sectionIndex].active = true;
							activatedSections.push(mb.courses[courseIndex].sections[sectionIndex]);
						}
					}
				}
			}
			mb.closeDialog("load-dialog");
		}

		mb.selectedSchedule = function (event) {
			var selectedScheduleName = event.target.innerHTML;
			for (var loadedScheduleIndex = 0; loadedScheduleIndex < mb.loadedSchedules.length; loadedScheduleIndex++) {
				var schedule = mb.loadedSchedules[loadedScheduleIndex];
				if (schedule.name == selectedScheduleName) {
					mb.selectedScheduleIndex = loadedScheduleIndex;
				}
			}
		};

		mb.openDialog = function (name) {
			var dialog = document.getElementById(name);
			dialog.open();
			window.setTimeout(function () {
				dialog.center();
			},1);
		}

		mb.closeDialog = function (name) {
			var dialog = document.getElementById(name);
			dialog.close();
		}

		mb.init();
	}
})();