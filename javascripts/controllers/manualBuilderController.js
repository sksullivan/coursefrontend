(function () {
    "use strict";

    angular
        .module('scheedule')
        .controller('ManualBuilderController', ManualBuilderController)

    function ManualBuilderController (CourseDataService, AgendaService) {
        var mb = this;
        mb.init = function () {
            console.log("Loaded manual builder controller.");
            mb.initializationRequests = 2;
            mb.showAgenda = false;
            mb.courses = [];
            mb.selectedCourses = [];

            var termCallback = function (term) {
                console.log("Got most recent term.");
                mb.termId = term.id;
                checkCourseInfoCompletion();
            };

            var termErrCallback = function (err) {
                console.log("Couldn't get most recent term from backend.");
                courseInfoErrCallback();
            };

            var coursesCallback = function (courses) {
                console.log("Loaded courses.");
                mb.courseIdMap = mb.makeCourseIdMap(courses);
                checkCourseInfoCompletion();
            };

            var coursesErrCallback = function (err) {
                console.log("Couldn't load course data from backend.");
                courseInfoErrCallback();
            };

            var checkCourseInfoCompletion = function () {
                mb.initializationRequests--;
                if (mb.initializationRequests == 0) {
                    courseInfoCompletionCallback();
                }
            };

            var courseInfoErrCallback = function () {
                console.err("Could not load course info.");
            };

            var courseInfoCompletionCallback = function () {
                console.log("Course info loading complete.");
                CourseDataService.getSections(mb.termId, sectionsCallback, sectionsErrCallback);
            };

            var sectionsCallback = function (courseSectionMap) {
                console.log("Loaded sections.");
                for (var courseId in courseSectionMap) {
                    mb.courseIdMap[courseId].sections = courseSectionMap[courseId];
                }
                mb.courses = mb.convertCoursesToCalendarFormat(mb.courseIdMap);
                mb.agenda.addSeriesForSection(mb.courses[1].sections[0]);
                mb.showAgenda = true;
            }

            var sectionsErrCallback = function (err) {
                console.log("Couldn't load Course data from backend.");
                courseInfoErrCallback();
            };

            CourseDataService.getMostRecentValidTerm(termCallback,termErrCallback);
            CourseDataService.getCourses(coursesCallback,coursesErrCallback);

            mb.agenda = AgendaService.blankAgenda();
            mb.eventSources = [];
        };

        mb.makeCourseIdMap = function (courses) {
            var courseIdMap = new Object();
            for (var course of courses) {
                courseIdMap[course.id] = course;
            }
            return courseIdMap;
        }

        mb.convertCoursesToCalendarFormat = function (courseIdMap) {
            var formattedCourses = []
            for (var courseId in courseIdMap) {
                var formattedCourse = {
                    name: courseIdMap[courseId].department + " " + courseIdMap[courseId].number,
                    title: courseIdMap[courseId].title
                };
                if (courseIdMap[courseId].sections != undefined) {
                    formattedCourse.sections = mb.convertSectionsToCalendarFormat(courseIdMap[courseId],courseIdMap[courseId].sections);
                } else {
                    formattedCourse.sections = [];
                }
                if (formattedCourse.sections.length > 0) {
                    formattedCourses.push(formattedCourse);
                }
            }
            return formattedCourses;
        }

        mb.getDayIndicesFromInitialString = function (initialString) {
            var days = [];
            for (var letterIndex = 0; letterIndex < initialString.length; letterIndex++) {
                var dayInitial = initialString.charAt(letterIndex);
                if (dayInitial == 'M') {
                    days.push(0);
                } else if (dayInitial == 'T') {
                    days.push(1);
                } else if (dayInitial == 'W') {
                    days.push(2);
                } else if (dayInitial == 'R') {
                    days.push(3);
                } else if (dayInitial == 'F') {
                    days.push(4);
                }
            }
            return days;
        }

        mb.convertSectionsToCalendarFormat = function (course, sections) {
            var formattedSections = [];
            for (var section of sections) {
                var days = mb.getDayIndicesFromInitialString(section.days_of_the_week);
                var duration = Math.abs(new Date(section.end_time) - new Date(section.start_time));
                var hourLengthMillSec = 3600000.0;
                formattedSections.push({
                    courseName: course.department + " " + course.number,
                    name: section.number,
                    startHour: (new Date(section.start_time)).getHours(),
                    endHour: (new Date(section.end_time)).getHours(),
                    duration: (new Date(duration)),
                    days: days,
                    decimalHours: duration/hourLengthMillSec,
                    active: false
                });
            }
            return formattedSections;
        }

        mb.addSection = function (section) {
            mb.agenda.addSeriesForSection(section);
        }

        mb.removeCourse = function (index, event) {
            
        }

        mb.clickSection = function (section, course, index) {
            console.log("section");
        }

        mb.indexOfSection = function (events, section, course) {
            
        }

        mb.deleteSection = function (section, course) {
            
        }

        mb.init();
    }
})();