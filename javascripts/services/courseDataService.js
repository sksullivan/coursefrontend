(function () {
    "use strict";

    angular
        .module('scheedule')
        .service('CourseDataService', CourseDataService)

    function CourseDataService ($http) {
        var cds = this;
        console.log("Loaded course data service.");

        cds.init = function () {
            cds.mostRecentValidTermName = "FA15_1";
        }

        cds.getCourses = function (processCourses, processErr) {
            $http.get('/courses.json').then(function (courses) {
                processCourses(courses.data);
            }, function (err) {
                processErr(err);
            });
        };

        cds.getMostRecentValidTerm = function (processTerm, processErr) {
            $http.get('/terms.json').then(function (terms) {
                for (var term of terms.data) {
                    if (term.name == cds.mostRecentValidTermName) {
                        processTerm(term);
                        return;
                    }
                }
            }, function (err) {
                processErr(err);
            });
        };

        cds.getSections = function (term, processSections, processErr) {
            $http.get('/terms/'+term+'/course_offerings.json').then(function (courseOfferings) {
                var courseSectionMap = new Object();
                var offeringCount = courseOfferings.data.length;
                for (var offering of courseOfferings.data) {
                    // We wrap this next API request in a SEAF to capture the offering vaiable.
                    (function (offering) {
                        $http.get('/course_offerings/'+offering.id+'/sections.json').then(function (sections) {
                            courseSectionMap[offering.course_id] = sections.data;
                            if (--offeringCount == 0) {
                                processSections(courseSectionMap);
                            }
                        }, function (err) {
                            processErr(err);
                            offeringCount--;
                        });
                    })(offering);
                }
            }, function (err) {
                processErr(err);
            });
        }
        
        cds.init();
    }
})();