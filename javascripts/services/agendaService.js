(function () {
    "use strict";

    angular
        .module('scheedule')
        .service('AgendaService', AgendaService)

    function AgendaService (AgendaModelService) {
        var as = this;
        var agenda = {};

        as.init = function () {
            as.maxHour24 = 18;
            as.minHour24 = 6;

            as.initChartData();
            as.initChartFunctions();    
        };

        as.initChartFunctions = function () {
            agenda.addSeriesForCourse = function (course) {


                var newSeries = [];
                for (var section of course.sections) {
                    for (var day of section.days) {
                        newSeries.push(agenda.seriesPointForSectionDay(section,day));
                    }
                }
                agenda.chartData.series.push(newSeries);
            };

            agenda.addSeriesForSection = function (section) {
                AgendaModelService.mutateSchedule({
                    type: "add",
                    section: section,
                },
                agenda.chartData.series,
                function (err) {
                    if (err == "DUPLICATE") {
                        alert("Duplaicate class, adding anyway.");
                        return true;
                    }
                    return false;
                });
            };

            agenda.removeSeriesForSection = function (section) {
                AgendaModelService.mutateSchedule({
                    type: "remove",
                    section: section,
                },
                agenda.chartData.series,
                function (err) {
                    if (err == "DOES_NOT_EXIST") {
                        alert("We couldn't find the class you're trying to remove.");
                        return true;
                    }
                    return false;
                });
            };
        }

        as.initChartData = function () {
            AgendaModelService.maxHour24 = 18;
            AgendaModelService.minHour24 = 6;
            agenda.chartEvents = {
                draw: function eventHandler(data) {
                    if (data.type === 'point') {
                        var w = data.axisX.axisLength/(data.axisX.ticks.length-1);
                        console.log(data);
                        data.element.replace(new Chartist.Svg('rect', {
                            x: data.x,
                            y: data.y,
                            width: w,
                            height: data.axisY.options.offset*data.series[data.index].decimalHours,
                            opacity: 0.5
                        }, 'ct-slice-pie'));
                        data.group.elem('text', {
                            x: data.x,
                            y: data.y+25, 
                            fill: "white"
                        }).text(
                            data.series[data.index].courseName+" - "+data.series[data.index].name
                        );
                    }
                },
            };

            agenda.chartOptions = {
                seriesBarDistance: 0,
                showLine: false,
                axisY: {
                    labelInterpolationFnc: function (value) {
                        value = as.minHour24 + as.maxHour24 - value;
                        if (value == 12) {
                            return value + ":00 PM"
                        } else if (value > 12) {
                            value = value % 12;
                            return value + ":00 PM"
                        } else {
                            return value + ":00 AM"
                        }
                    },
                    onlyInteger: true,
                    high: 18,
                    low: 6,
                },
                axisX: {
                    type: Chartist.AutoScaleAxis,
                    high: 5,
                    low: 0,
                    onlyInteger: true,
                    labelInterpolationFnc: function(value) {
                        if (value == 0) {
                            return "Monday";
                        } else if (value == 1) {
                            return "Tuesday";
                        } else if (value == 2) {
                            return "Wednsday";
                        } else if (value == 3) {
                            return "Thursday";
                        } else if (value == 4) {
                            return "Friday";
                        }
                    },
                }
            };

            agenda.chartData = {
                labels: ['Monday', 'Tuesday', 'Wednsday', 'Thursday', 'Friday'],
                series: []
            };
        }

        as.blankAgenda = function () {
            return agenda;
        }

        as.init();
    }
})();