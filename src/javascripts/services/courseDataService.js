(function () {
    "use strict";

    angular
        .module('scheedule')
        .service('CourseDataService', ['$http', CourseDataService]);

    function CourseDataService ($http) {
        var cds = this;
        console.log("Loaded course data service.");

        cds.init = function () {
            cds.timeFormat = "hh:mm a";
        }

        cds.getCourses = function (processPartialCourses, processErr) {
            $http.get('/api/all').then(function (courses) {
                cds.formatCourseArray(courses.data,processPartialCourses);
            }, function (err) {
                processErr(err);
            });
        };

        cds.formatCourseArray = function (courses, partialCompletionCallback) {
            var formattedCourses = []
            var i = 0;
            for (var course of courses) {
                if (i > 10) {
                    partialCompletionCallback(formattedCourses);
                    i = 0;
                    formattedCourses = new Array();
                    setTimeout(cds.formatCourseArray(courses.splice(0,10),partialCompletionCallback),0);
                    return;
                }
                i++;
                var formattedCourse = {
                    shortName: course.Department + " " + course.CourseNumber,
                    longName: course.Name,
                    id: course.ID,
                    sections: []
                };
                for (var section of course.Sections) {
                    formattedCourse.sections = cds.formatSectionsArray(formattedCourse,course.Sections);
                }
                formattedCourses.push(formattedCourse);
            }
            console.log("Finished formatting course array.");
            partialCompletionCallback(formattedCourses);
        }

        cds.formatSectionsArray = function (course, sections) {
            var formattedSections = [];
            for (var section of sections) {
                for (var meeting of section.Meetings) {
                    var days = cds.getDayIndicesFromInitialString(meeting.Days);
                    var startDate = moment(meeting.Start,cds.timeFormat);
                    var endDate = moment(meeting.End,cds.timeFormat);
                    formattedSections.push({
                        id: section.CRN,
                        courseId: course.shortName,
                        courseName: course.shortName,
                        name: section.Code,
                        startMoment: startDate,
                        endMoment: endDate,
                        days: days,
                        active: false,
                        hovering: false
                    });
                }
            }
            return formattedSections;
        }

        cds.getDayIndicesFromInitialString = function (initialString) {
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
        
        cds.init();
    }
})();