(function () {
    "use strict";

    angular
        .module('scheedule')
        .service('CourseDataService', ['$http', CourseDataService]);
    
    // Course Data Service
    // ---------------
    //
    // Contains functions for api calls to the backend for
    // course information, course scheduling and schedule saving;

    function CourseDataService ($http) {
        var cds = this;
        console.log("Loaded course data service.");

        cds.init = function () {
            cds.timeFormat = "hh:mm a";
        }

        //Takes two function callback; one with a parameter containing the course
        //data and one for errors
        cds.getCourses = function (processPartialCourses, processErr) {
            // Skips formatting if courses already processed
            if (cds.formattedCourses !== undefined) {
                console.log("Using formatted data");
                processPartialCourses(cds.formattedCourses);
            } else {
                // Process data if GET request finished before call
                if (window.courseArray !== undefined) {
                    console.log("Using courseArray");
                    cds.tempCourseData = window.courseArray;
                    cds.formatCourseArray(processPartialCourses);
                } else {
                    // Set function for GET request callback
                    window.courseArrayCallback = function (courses) {
                        console.log("Using courseArrayCallback");
                        cds.tempCourseData = courses;
                        cds.formatCourseArray(processPartialCourses);
                    };
                    // $http.get('/api/prx/course/all').then(function (courses) {
                    //     cds.tempCourseData = courses.data;
                    //     cds.courseToProcessIndex = 0;
                    //     cds.formatCourseArray(processPartialCourses);
                    // }, function (err) {
                    //     processErr(err);
                    // });
                }
            }
        };

        cds.saveSchedule = function (CRNList, name, processSuccess, processErr) {
            $http.put('/api/prx/schedule', {name: name, CRNList: CRNList}).then(function () {
                processSuccess();
            }, function (err) {
                processErr(err);
            });
        };

        cds.loadSchedules = function (processSchedules, processErr) {
            $http.get('/api/prx/schedule').then(function (schedules) {
                processSchedules(schedules.data);
            }, function (err) {
                processErr(err);
            });
        };

        cds.deleteSchedule = function (schedule, processSuccess, processErr) {
            $http.delete('/api/prx/schedule?' + $.param({name: schedule.name})).then(function () {
                processSuccess();
            }, function (err) {
                processErr(err);
            });
        };

        // cds.formatCourseArray = function (partialCompletionCallback) {
        //     var course = cds.tempCourseData[cds.courseToProcessIndex];
        //     var formattedCourse = {
        //         shortName: course.department + " " + course.courseNumber,
        //         longName: course.name,
        //         id: course.id,
        //         sections: []
        //     };
        //     for (var section of course.sections) {
        //         formattedCourse.sections = cds.formatSectionsArray(formattedCourse,course.sections);
        //     }
        //     partialCompletionCallback([formattedCourse]);
        //     cds.courseToProcessIndex++;
        //     if (cds.courseToProcessIndex < cds.tempCourseData.length) {
        //         setTimeout(function () {
        //             cds.formatCourseArray(partialCompletionCallback);
        //         },0);
        //     }
        //     // console.log("Finished formatting course array.");
        // }

        cds.formatCourseArray = function (partialCompletionCallback) {
            var formattedCourses = [];
            for (var course of cds.tempCourseData) {
                var formattedCourse = {
                    shortName: course.department + " " + course.courseNumber,
                    longName: course.name,
                    id: course.id,
                    sections: []
                };
                for (var section of course.sections) {
                    formattedCourse.sections = cds.formatSectionsArray(formattedCourse,course.sections);
                }
                formattedCourses.push(formattedCourse);
            }
            cds.formattedCourses = formattedCourses;
            partialCompletionCallback(formattedCourses);
        };

        cds.formatSectionsArray = function (course, sections) {
            var formattedSections = [];
            for (var section of sections) {
                for (var meeting of section.meetings) {
                    var days = cds.getDayIndicesFromInitialString(meeting.days);
                    var startDate = moment(meeting.start,cds.timeFormat);
                    var endDate = moment(meeting.end,cds.timeFormat);
                    var formattedSection = {
                        id: section.crn,
                        courseId: course.shortName,
                        courseName: course.shortName,
                        name: section.code,
                        start: meeting.start,
                        end: meeting.end,
                        startMoment: startDate,
                        endMoment: endDate,
                        days: days,
                        dayString: meeting.days,
                        enrollmentStatus: section.enrollmentStatus,
                        active: false,
                        hovering: false
                    };
                    if (formattedSection.name == "") {
                        formattedSection.name = "NO NAME";
                    }
                    formattedSections.push(formattedSection);
                }
            }
            return formattedSections;
        };

        cds.getDayIndicesFromInitialString = function (initialString) {
            var days = [];
            for (var letterIndex = 0; letterIndex < initialString.length; letterIndex++) {
                var dayInitial = initialString.charAt(letterIndex);
                if (dayInitial == 'M') {
                    days.push("Monday");
                } else if (dayInitial == 'T') {
                    days.push("Tuesday");
                } else if (dayInitial == 'W') {
                    days.push("Wednesday");
                } else if (dayInitial == 'R') {
                    days.push("Thursday");
                } else if (dayInitial == 'F') {
                    days.push("Friday");
                }
            }
            return days;
        }
        
        cds.init();
    }
})();
