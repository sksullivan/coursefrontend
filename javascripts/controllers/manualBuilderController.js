(function () {
    "use strict";

    angular
        .module('scheedule')
        .controller('ManualBuilderController', ManualBuilderController)

    function ManualBuilderController (CourseDataService, AgendaService) {
        var mb = this;
        mb.init = function () {
            console.log("Loaded manual builder controller.");
            mb.showAgenda = false;
            mb.courses = [];
            mb.selectedCourses = [];

            CourseDataService.getCourses(function (courses) {
                console.log("Loaded courses.");
                mb.courses = courses;
            }, function (err) {
                console.log("Couldn't load course data from backend.");
            });

            mb.agenda = AgendaService.blankAgenda();
        };


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