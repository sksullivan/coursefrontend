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
            $http.get('/api/prx/course/all').then(function (courses) {
                cds.tempCourseData = courses.data;
                cds.courseToProcessIndex = 0;
                setTimeout(function () {
                    cds.formatCourseArray(processPartialCourses);
                }, 1);
            }, function (err) {
                processErr(err);
            });
        };

        cds.saveSchedule = function (CRNList, name, processSuccess, processErr) {
            $http.put('/api/prx/schedule', {name: name, CRNList: CRNList}).then(function () {
                console.log({name: name, CRNList: CRNList});
                processSuccess();
            }, function (err) {
                processErr(err);
            });
        }

        cds.loadSchedules = function (processSchedules, processErr) {
            $http.get('/api/prx/schedule').then(function (schedules) {
                processSchedules(schedules.data);
                console.log(schedules);
            }, function (err) {
                processErr(err);
            });
        }

        cds.deleteSchedule = function (schedule, processSuccess, processErr) {
            console.log(schedule.name);
            $http.delete('/api/prx/schedule?' + $.param({name: schedule.name})).then(function () {
                processSuccess();
            }, function (err) {
                processErr(err);
            });
        }

        cds.formatCourseArray = function (partialCompletionCallback) {
            var course = cds.tempCourseData[cds.courseToProcessIndex];
            var formattedCourse = {
                shortName: course.Department + " " + course.CourseNumber,
                longName: course.Name,
                id: course.ID,
                sections: []
            };
            for (var section of course.Sections) {
                formattedCourse.sections = cds.formatSectionsArray(formattedCourse,course.Sections);
            }
            partialCompletionCallback([formattedCourse]);
            cds.courseToProcessIndex++;
            if (cds.courseToProcessIndex < cds.tempCourseData.length) {
                setTimeout(function () {
                    cds.formatCourseArray(partialCompletionCallback);
                },1);
            }
            // console.log("Finished formatting course array.");
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