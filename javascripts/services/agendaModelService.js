(function () {
    "use strict";

    angular
        .module('scheedule')
        .service('AgendaModelService', AgendaModelService)

    function AgendaModelService () {
        var ams = this;

        ams.init = function () {
            ams.courseSeriesIndexMap = {};
            ams.operationList = [];
        };

        ams.verifyOperation = function (operation) {
            if (operation.type == "add") {
                return {success: true};
            } else if (operation.type == "remove") {
                return {success: true};
            } else {
                return {success: false, err: "DUPLICATE"};
            }
        }

        ams.mutateSchedule = function (operation, seriesData, errCallback) {
            var verifyStatus = ams.verifyOperation(operation);
            if (verifyStatus.success) {
                ams.operationList.push(operation);
                ams.executeOperation(operation, seriesData);
            } else {
                var shouldContinue = errCallback(verifyStatus.err);
                if (shouldContinue) {
                    ams.executeOperation(operation, seriesData);
                }
            }
        }

        ams.executeOperation = function (operation, seriesData) {
            console.log("Executing:");
            console.log(operation);

            if (operation.type == "add") {
                var newSeries = [];
                for (var day of operation.section.days) {
                    newSeries.push(ams.seriesPointForSectionDay(operation.section,day));
                }
                if (ams.courseSeriesIndexMap[operation.section.courseName] === undefined) {
                    seriesData.push(newSeries);
                    ams.courseSeriesIndexMap[operation.section.courseName] = seriesData.indexOf(newSeries);
                } else {
                    for (var seriesPoint of newSeries) {
                        seriesData[ams.courseSeriesIndexMap[operation.section.courseName]].push(seriesPoint);
                    }
                }
            }
        }

        ams.seriesPointForSectionDay = function (section, day) {
            return {
                x: day,
                y: ams.maxHour24 - section.startHour + ams.minHour24,
                name: section.name,
                courseName: section.courseName,
                decimalHours: section.decimalHours
            }
        }

        ams.init();
    }
})();