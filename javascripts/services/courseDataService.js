(function () {
    "use strict";

    angular
        .module('scheedule')
        .service('CourseDataService', CourseDataService)

    function CourseDataService ($http) {
        var cds = this;
        console.log("Loaded course data service.");

        cds.init = function () {
            cds.timeFormat = "hh:mm a";
        }

        cds.getCourses = function (processCourses, processErr) {
            $http.get('/api/all').then(function (courses) {
                processCourses(cds.formatCourseArray(courses.data));
            }, function (err) {
                processErr(err);
            });
        };

        cds.formatCourseArray = function (courses) {
            var formattedCourses = []
            var i = 0;
            for (var course of courses) {
                if (++i > 10) {
                    break;
                }
                var formattedCourse = {
                    shortName: course.Department + " " + course.CourseNumber,
                    longName: course.Name,
                    id: course.ID,
                    sections: []
                };
                for (var section of course.Sections) {
                    formattedCourse.sections = cds.formatSectionsArray(formattedCourse.shortName,course.Sections);
                }
                formattedCourses.push(formattedCourse);
            }
            console.log("Finished formatting course array.");
            return formattedCourses;
        }

        cds.formatSectionsArray = function (courseName, sections) {
            var formattedSections = [];
            for (var section of sections) {
                for (var meeting of section.Meetings) {
                    var days = cds.getDayIndicesFromInitialString(meeting.Days);
                    var startDate = moment(meeting.Start,cds.timeFormat);
                    var endDate = moment(meeting.End,cds.timeFormat);
                    formattedSections.push({
                        courseName: courseName,
                        name: section.Code,
                        startMoment: startDate,
                        endMoment: endDate,
                        days: days,
                        active: false
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