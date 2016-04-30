(function () {
	"use strict";

	angular
		.module('scheedule')
		.controller('ManualBuilderController', ['$scope','$rootScope','$filter','AuthService','CourseDataService', 'd3CalendarService','AgendaModelService', ManualBuilderController]);

	// Manual Agenda Builder Controller
	// ----------------
	//
	// Coordinates creating of agenda view, course selection accordions,
	// course searching and agenda/accordion interactions.
	function ManualBuilderController ($scope, $rootScope, $filter, AuthService, CourseDataService, d3CalendarService, AgendaModelService) {
		var mb = this;
		mb.init = function () {
			console.log("Loaded manual builder controller.");
            mb.courses = [];
            mb.selectedCourses = [];
			mb.dialogs = {
				save: false,
				saveSuccess: false,
				manage: false,
				login: false,
			};

			mb.hideAllDialogs();

			// Load courses from Course Data Service.
			CourseDataService.getCourses(function (someCourses) {
				console.log("PROCESSING Courses");
                mb.courses = someCourses;

			}, function (err) {
				console.log("Couldn't load course data from backend.");
				console.log(err);
				mb.showError("Couldn't load course data from backend.",err);
			});

			// Listen for events broadcast from other controllers on the root scope.
			$rootScope.$on('openSaveSchedule', function () {
				mb.openDialog("save");
			});

			$rootScope.$on('closeSaveSchedule', function () {
				mb.closeDialog("save");
			});

			$rootScope.$on('openManageSchedules', function () {
				mb.loadSchedules(function () {
					mb.openDialog("manage");
				});
			});;
            
            // Create d3Calendar object
            mb.calendar = d3CalendarService.createCalendar(document.getElementById('cal'));
            
            // Load events from model service
            mb.displaySchedule(AgendaModelService.activeSections);
          
            // Set resize event
            d3.select(window).on('resize', mb.calendar.resize);
		};

        // Used in check for ng-class for section
        mb.isOpen = function (section) {
            if (section.enrollmentStatus.substring(0,4) == "Open" && !section.active)
                return true;
            return false;
        }
 
        // Used in check for ng-class for section
        mb.isClosed = function (section) {
            if (section.enrollmentStatus.substring(0,6) == "Closed" && !section.active)
                return true;
            return false;
        }

        // Fired upon selecting a class from dropdown
        mb.addCourse = function (selectedCourse) {
            // Filter from list of courses so that selected course no longer appears
            mb.courses = mb.courses.filter(function(e) {
                return selectedCourse.shortName != e["shortName"];
            });
            mb.selectedCourses.push(selectedCourse);
        };

        // Fired upon clicking remove glyph on course
        mb.removeCourse = function (selectedCourse) {
            mb.selectedCourses = mb.selectedCourses.filter(function(e) {
                return selectedCourse.shortName != e["shortName"];
            });
            // Return course back to coursse list
            mb.courses.push(selectedCourse);
        };

		// Fired upon clicking a section.
		mb.clickSection = function (section) {
            // Add or Remove events from calendar and model service
			if (section.active) {
				// Selection no longer appears highlighted  
				section.active = false;
				AgendaModelService.removeActiveSection(section.id);
                mb.calendar.removeSection(section.id);
                // Rehighlight selection after event removal
				mb.highlightSection(section);
			} else {
				mb.unhighlightSection(section);
                // Selection appears highlighted
				section.active = true;
				AgendaModelService.addActiveSection(section.id);
                mb.calendar.addClass({
                    classId: section.courseId,
                    sectionId: section.id,
                    start: section.startMoment,
                    end: section.endMoment,
                    meetingTimes: section.days,
                    content: section.name,
                    hovering: section.hovering
                });
			}
		};

		// Fired when the mosueenter event occurs on a section.
		mb.highlightSection = function (section) {
			// Only add the translucent hover section to the agenda if the section isn't already selected.
			if (!section.active) {
				section.hovering = true;
				mb.calendar.addClass({
                    classId: section.courseId,
                    sectionId: section.id,
                    start: section.startMoment,
                    end: section.endMoment,
                    meetingTimes: section.days,
                    content: section.name,
                    hovering: section.hovering
                });
			}
		};

		// Fired when the mosueleave event occurs on a section.
		mb.unhighlightSection = function (section) {
			// Only remove the hover section from the agenda if the section was
			// already being hovered over (i.e. prevent removing selected sections).
			if (section.hovering) {
				section.hovering = false;
				mb.calendar.removeSection(section.id);
			}
            
		};

        // Delete a schedule from the manager and reload schedules
		mb.deleteSchedule = function (schedule) {
			CourseDataService.deleteSchedule(schedule, function () {
				mb.loadSchedules();
			}, function (err) {
				console.log("Error deleting schedule.");
				console.log(err);
				mb.showError("Error deleting schedule.",err);
			});
		};

		// Save the current set of sections on the calendar.
		mb.saveSchedule = function () {
			console.log("Saving schedule...");
			mb.closeDialog('save');
			var CRNList = AgendaModelService.activeSections;
			// Grab the active section from our list of courses.
            /*
			for (var CRN of $filter('ActiveCRNFilter')(mb.courses)) {
				CRNList.push(CRN);
			}
            */

			// Send that list off to the API.
			CourseDataService.saveSchedule(CRNList,mb.scheduleTitle,function () {
				console.log("Saved schedule.");
				// If things went ok, close the save dialog.
				mb.openDialog('saveSuccess');
				setTimeout(function () {
					$scope.$apply(function () {
						mb.closeDialog('saveSuccess');
					});
				},3000);
			}, function (err) {
				// If there was an error (not logged in, not inet access, etc.)
				// display an error dialog.
				console.log("Error saving schedule.");
				console.log(err);
				mb.showError("Error saving schedule.",err);
			});
		};

		// Load up a list of schedules to pick from in our load schedules dialog.
		mb.loadSchedules = function (handleLoadedSchedules) {
			console.log("Loading schedules...");
			// Get the list of schedules from the API.
            mb.loadedSchedules = [
                {
                    name: "durr",
                    CRNList: [11111,54321,66666]
                }       
            ];
            handleLoadedSchedules();
            /*
			CourseDataService.loadSchedules(function (schedules) {
				console.log("Loaded schedules.");
				// Throw the data we got back from the API into the list of possible
				// schedules to load on our load dialog.
				mb.loadedSchedules = schedules;
				if (handleLoadedSchedules !== undefined) {
					handleLoadedSchedules();
				}
			}, function (err) {
				// If we had trouble getting the list of schedules, show an error
				// dialog.
				console.log("Error loading schedules.");
				console.log(err);
				mb.showError("Error loading schedules.",err);
			});
            */
		};

		// Display a selected, loaded schedule into our calendar.
		mb.displaySchedule = function (CRNList) {
            mb.calendar.clearClasses(); 
            for (var courseIndex = 0; courseIndex < mb.courses.length; courseIndex++) {
                for (var sectionIndex = 0; sectionIndex < mb.courses[courseIndex].sections.length; sectionIndex++) {
                    mb.courses[courseIndex].sections[sectionIndex].active = false;
                }
            }
            AgendaModelService.clearActiveSections();
			// Get the list of CRNs for the selected schedule (this index is set 
			// in the ng-click listener for schedule-names)
			var activatedSections = [];
			// Iterate through all CRNs in our list.
			for (var crnIndex = 0; crnIndex < CRNList.length; crnIndex++) {
				// Iterate through all sections in all courses in mb.courses.
				for (var courseIndex = 0; courseIndex < mb.courses.length; courseIndex++) {
					for (var sectionIndex = 0; sectionIndex < mb.courses[courseIndex].sections.length; sectionIndex++) {
						// If the section we're looking at is on our list of CRNs, add it to our calendar.
						// Also add it 
						if (CRNList[crnIndex] == mb.courses[courseIndex].sections[sectionIndex].id) {
				            var section = mb.courses[courseIndex].sections[sectionIndex];
                            mb.unhighlightSection(section);
                            // Set the sections to appear highlighted
                            section.active = true;
                            AgendaModelService.addActiveSection(section.id);
                            mb.calendar.addClass({
                                classId: section.courseId,
                                sectionId: section.id,
                                start: section.startMoment,
                                end: section.endMoment,
                                meetingTimes: section.days,
                                content: section.name,
                                hovering: section.hovering
                            });
                            
                            // Generate selected course list
                            if (mb.selectedCourses.indexOf(mb.courses[courseIndex]) === -1)
                                mb.selectedCourses.push(mb.courses[courseIndex]);
						}
					}
				}
			}

            // Remove selection options from course list
            for (var selectedCourse of mb.selectedCourses) {
                mb.courses = mb.courses.filter(function(e) {
                    return selectedCourse.shortName != e["shortName"];
                });
            }

			mb.closeDialog("manage");
		}

        /*
		mb.selectSchedule = function (event) {
			var selectedScheduleName = event.target.innerHTML;
			if (selectedScheduleName != "") {
				selectedScheduleName = selectedScheduleName.slice(0, selectedScheduleName.indexOf("<")).trim();
			}
			for (var loadedScheduleIndex = 0; loadedScheduleIndex < mb.loadedSchedules.length; loadedScheduleIndex++) {
				var schedule = mb.loadedSchedules[loadedScheduleIndex];
				if (schedule.name == selectedScheduleName) {
					mb.selectedScheduleIndex = loadedScheduleIndex;
				}
			}
		};
        */

		mb.hideAllDialogs = function () {
			$('#save').hide();
			$('#saveSuccess').hide();
			$('#manage').hide();
			$('#error').hide();
		}

		mb.openDialog = function (name) {
			$('#'+name).fadeIn();
		}

		mb.closeDialog = function (name) {
			$('#'+name).fadeOut();
		}

		mb.showError = function (friendlyMessage, message) {
			$('#error-message').html(friendlyMessage + "<br><br>" + JSON.stringify(message));
			mb.openDialog('error');
			setTimeout(function () {
				$scope.$apply(function () {
					mb.closeDialog('error');
				});
			},5000);
		}

		mb.init();
	}
})();
