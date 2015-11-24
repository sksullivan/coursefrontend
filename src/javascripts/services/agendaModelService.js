(function () {
    "use strict";

    angular
        .module('scheedule')
        .service('AgendaModelService', AgendaModelService);

    function AgendaModelService () {
        var ams = this;

        ams.init = function () {
            ams.activeCourses = {};
            ams.operationList = [];
            ams.availableColorIndices = [0,1,2,3,4,5,6,7];
        };

        ams.verifyOperation = function (operation) {
            if (operation.type == "add") {
                return {success: true};
            } else if (operation.type == "add-hover") {
                return {success: true};
            } else if (operation.type == "remove") {
                if (ams.activeCourses[operation.section.courseId][operation.section.id] === undefined) {
                    return {success: false, err: "DOES_NOT_EXIST"};
                }
                return {success: true};
            } else {
                return {success: false, err: "DUPLICATE"};
            }
        };

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
            if (operation.type == "add" || operation.type == "add-hover") {
                ams.executeAddOperation(operation, seriesData);
            } else if (operation.type == "remove") {
                ams.executeRemoveOperation(operation, seriesData);
            }
        };

        ams.executeAddOperation = function (operation, seriesData) {
            var newSeries = [];

            if (operation.type == "add-hover") {
                for (var day of operation.section.days) {
                    newSeries.push(ams.seriesPointForSectionDay(operation.section,day,true));
                }
            } else {
                for (var day of operation.section.days) {
                    newSeries.push(ams.seriesPointForSectionDay(operation.section,day,false));
                }
            }

            // Add course to map of active courses if not already extant
            if (ams.activeCourses[operation.section.courseId] === undefined) {
                // Initialize the active course object with an empty map of secitons
                ams.activeCourses[operation.section.courseId] = {};

                // Color index was already set in ams.seriesPointForSectionDay
                ams.activeCourses[operation.section.courseId].colorIndex = ams.availableColorIndices[0];
                ams.availableColorIndices.splice(0,1);
                for (var seriesPoint of newSeries) {
                    seriesPoint.colorIndex = ams.activeCourses[operation.section.courseId].colorIndex;
                }

                // Add our new series to the calendar
                if (newSeries.length == 0) {
                        newSeries.push({
                        x: 0,
                        y: 0,
                        name: operation,
                        courseName: operation,
                        decimalHours: 0,
                        type: "normal"
                    });
                }
                seriesData.push(newSeries);
                ams.activeCourses[operation.section.courseId].index = seriesData.indexOf(newSeries);

                // Set the index of the first item in our new series in the array of items for our course
                ams.activeCourses[operation.section.courseId][operation.section.id] = 0;

                // Finally, increment the number of sections for our course
                ams.activeCourses[operation.section.courseId].sectionCount = 1;
            } else {
                // Otherwise, just add the new series to the array for our course
                for (var seriesPoint of newSeries) {
                    seriesPoint.colorIndex = ams.activeCourses[operation.section.courseId].colorIndex;
                    seriesData[ams.activeCourses[operation.section.courseId].index].push(seriesPoint);
                }

                // Set the index of the first item in our new series in the array of items for our course
                ams.activeCourses[operation.section.courseId][operation.section.id] = seriesData[ams.activeCourses[operation.section.courseId].index].indexOf(newSeries[0]);
                ams.activeCourses[operation.section.courseId].sectionCount++;
            }
        }

        ams.executeRemoveOperation = function (operation, seriesData) {
            // Get index for our section
            var sectionIndex = ams.activeCourses[operation.section.courseId][operation.section.id];

            // Get course index
            var courseIndex = ams.activeCourses[operation.section.courseId].index;

            // Set entry in our course object for the section to be removed as undefined
            ams.activeCourses[operation.section.courseId][operation.section.id] = undefined;

            // Splice out n entries from our course's array in seriesData starting at our section index, where
            // n is the number of days for our section.
            seriesData[courseIndex].splice(sectionIndex,operation.section.days.length);

            // Iterate over our course object properties to find all entries corresponding to section indecies
            for (var property in ams.activeCourses[operation.section.courseId]) {
                // If the property is strictly numeric...
                if (ams.activeCourses[operation.section.courseId].hasOwnProperty(property) && ams.isNumeric(property)) {
                    // Get the index for each section
                    var candidateSectionIndex = ams.activeCourses[operation.section.courseId][property];
                    // If this candidate index is greater than the index of the section we just removed from
                    // our course's array in seriesData, we have to reindex. Subtract the number of items we
                    // spliced out from the section's index.
                    if (candidateSectionIndex > sectionIndex) {
                        ams.activeCourses[operation.section.courseId][property] -= operation.section.days.length;
                    }
                }
            }
            ams.activeCourses[operation.section.courseId].sectionCount--;
            if (ams.activeCourses[operation.section.courseId].sectionCount == 0) {
                var courseIndex = ams.activeCourses[operation.section.courseId].index;
                ams.availableColorIndices.unshift(ams.activeCourses[operation.section.courseId].colorIndex);
                ams.activeCourses[operation.section.courseId] = undefined;
                seriesData.splice(courseIndex,1);
                // Our course table needs to be reindexed in the same way as above
                for (var property in ams.activeCourses) {
                    if (ams.activeCourses.hasOwnProperty(property) && property != 'index' && property != 'sectionCount' && property != operation.section.courseId && ams.activeCourses[property] !== undefined) {
                        var candidateCourseIndex = ams.activeCourses[property].index;
                        if (candidateCourseIndex > courseIndex) {
                            ams.activeCourses[property].index -= 1;
                        }
                    }
                }
            }
        }

        ams.seriesPointForSectionDay = function (section, day, hover) {
            var point = {
                x: day,
                y: 24 - (section.startMoment.hours()+section.startMoment.minutes()/60.0),
                // y: 0,
                name: section.name,
                courseName: section.courseName,
                decimalHours: (section.endMoment.unix() - section.startMoment.unix())/3600.0,
                // decimalHours: 0,
                type: "normal"
            };
            if (hover) {
                point.type = "hover";
            }
            return point;
        };

        
        ams.isNumeric = function (num) {
            return !isNaN(parseFloat(num)) && isFinite(num);
        };

        ams.init();
    }
})();