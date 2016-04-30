(function () {
	"use strict";

	angular
		.module('scheedule')
		.controller('ScheduleViewerController', ['$scope','$rootScope','$filter','$location','d3CalendarService','AgendaModelService','CourseDataService',ScheduleViewerController]);

	// Schedule Viewer Controller
    // ---------------
    //
    // Creates a multi-calendar view of generated schedules saved in
    // the agenda model.
	function ScheduleViewerController ($scope, $rootScope, $filter, $location, d3CalendarService, AgendaModelService, CourseDataService) {
    	var viewer = this;

    	viewer.init = function () {
    		console.log("Loaded schedule view controller.");
            viewer.courses = [];
            viewer.schedules = [];
            viewer.detailedSchedules = [];
            viewer.calendars = {};
            viewer.numCalendars = 12;
            for (var i = 0; i < 5; i++)
            {
                viewer.schedules.push([31208]);
                viewer.schedules.push([31152]);
                viewer.schedules.push([31187]);
                viewer.schedules.push([61476]);
                viewer.schedules.push([31352]);
            } 
            viewer.minIndex = 0;
            viewer.maxIndex = Math.min(viewer.numCalendars,viewer.schedules.length);

            //Creates calendars and grabs course data after elements have been created
            $scope.$on('ngRepeatFinished', function(e) {
                console.log("Creating calendars");
                for (var i = 0; i < viewer.maxIndex-viewer.minIndex; i++)
                {
                    viewer.calendars[i] = d3CalendarService.createSchedule(document.getElementById("schedule-"+i.toString()));
                }
               
                // Load courses form Course Data Service
                CourseDataService.getCourses(function (someCourses) {
                    console.log("PROCESSING Courses");
                    /*$scope.$apply(function() {
                        for (var course of someCourses) {
                            viewer.courses.push(course);
                        }
                    });*/
                    viewer.courses = someCourses;
                   
                    // Getting detailed version of section
                    for (var scheduleCRNs of viewer.schedules)
                    {
                        var schedule = [];
                        for (var CRN of scheduleCRNs)
                        {
                            for (var course of viewer.courses)
                            {
                                for (var section of course.sections)
                                {
                                    if (CRN == section.id)
                                    {
                                        schedule.push(section);
                                    }
                                }
                            }
                        }
                        viewer.detailedSchedules.push(schedule);
                    }

                    viewer.setCalendars();

                }, function (err) {
                    console.log("Couldn't load course data from backend.");
                    console.log(err);
                    mb.showError("Couldn't load course data form backend.",err);
                });

                //Set resize event for all calendars
                function resize() {
                    for (var i = 0; i < viewer.numCalendars; i++)
                    {
                        viewer.calendars[i].resize();
                    }
                }

                d3.select(window).on('resize', resize);
            });
    	};

        // Fired upon clicking a schedule
        viewer.clickSchedule = function($index) {
            AgendaModelService.clearActiveSections();
            for (var schedule of viewer.detailedSchedules[$index+viewer.minIndex])
            {
                AgendaModelService.addActiveSection(schedule.id);
            }
            viewer.changeView('manual-builder');
        };

        // Clears all old events and adds the new set of schedules
        viewer.setCalendars = function() { 
            for (var i = 0; i < viewer.maxIndex-viewer.minIndex; i++)
            {
                viewer.calendars[i].clearClasses(); 
                for (var section of viewer.detailedSchedules[i+viewer.minIndex])
                {
                    viewer.calendars[i].addClass({
                        classId: section.courseId,
                        sectionId: section.id,
                        start: section.startMoment,
                        end: section.endMoment,
                        meetingTimes: section.days,
                        content: "",
                        hovering: section.hovering
                    });
                }
            }
        };

        // Fired upon clicking right arrow
        viewer.nextSchedules = function() {
            if (viewer.maxIndex < viewer.schedules.length)
            {
                viewer.minIndex += viewer.numCalendars;
                viewer.maxIndex = Math.min(viewer.maxIndex+viewer.numCalendars, viewer.schedules.length);
                viewer.setCalendars();
            }
        };

        // Fired upon clicking left arrow
        viewer.previousSchedules = function() {
            if (viewer.minIndex >= 12)
            {
                viewer.minIndex -= viewer.numCalendars;
                viewer.maxIndex = viewer.minIndex + viewer.numCalendars;
                viewer.setCalendars();
            }
        };

        // Hides calendar if it is beyond number of calendars
        viewer.hideCalendar = function($index) {
            if (viewer.minIndex + $index >= viewer.maxIndex)
                return true;
            return false;
        }

        // Changes the path of the site
        viewer.changeView = function(view) {
            $location.path(view);
        };

    	viewer.init();
	}
})();
