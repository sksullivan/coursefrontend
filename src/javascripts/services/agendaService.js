(function () {
	"use strict";

	angular
		.module('scheedule')
		.service('AgendaService', ['AgendaModelService', AgendaService]);

	// Agenda Service
	// ----------------
	//
	// Provides API wrapper around an agenda view. Allows for adding sections, removing sections.
	// Uses Agenda Model Service to provide feedback on these operations (adding a duplicate course,
	// removing a non-existent section).
	function AgendaService (AgendaModelService) {
		var as = this;
		var agenda = {};
		as.ams = AgendaModelService;

		// Initialize service. Set displayed hour range.
		// Create functions on chart objects and initialize
		// chart data.
		as.init = function () {
			as.initChartData();
			as.initChartFunctions();    
		};

		// Add functions to calendar object returned by service.
		as.initChartFunctions = function () {

			// Call into model service. Mutate schedule with add operation.
			// Alert "Duplicate section" if adding a duplicate section. Return success value.
			agenda.addNormalSeriesForSection = function (section) {
				AgendaModelService.mutateSchedule({
					type: "add",
					section: section,
				},
				agenda.chartData.series,
				function (err) {
					if (err == "DUPLICATE") {
						alert("Duplaicate section, adding anyway.");
						return true;
					}
					return false;
				});
			};

			// Call into model service. Mutate schedule with add operation.
			// Do not alert "Duplicate section" if adding a duplicate section.
			// Return success value.
			agenda.addHoverSeriesForSection = function (section) {
				AgendaModelService.mutateSchedule({
					type: "add-hover",
					section: section,
				},
				agenda.chartData.series,
				function (err) {
					if (err == "DUPLICATE") {
						alert("Duplaicate section, adding anyway.");
						return true;
					}
					return false;
				});
			};

			// Call into model service. Mutate schedule with remove operation.
			// Alert "non-existent section" if removing a section not on agenda.
			agenda.removeSeriesForSection = function (section) {
				AgendaModelService.mutateSchedule({
					type: "remove",
					section: section,
				},
				agenda.chartData.series,
				function (err) {
					if (err == "DOES_NOT_EXIST") {
						alert("We couldn't find the section you're trying to remove.");
						return true;
					}
					return false;
				});
			};
		}

		// Set up drawing function on chart object, set chart options.
		as.initChartData = function () {
			agenda.chartEvents = {
				draw: function eventHandler(data) {
					if (data.type === 'point') {
						var yScale = data.axisY.axisLength/(data.axisY.ticks.length)/1.70;
						var w = data.axisX.axisLength/(data.axisX.ticks.length-1);
						var newSvgElement = new Chartist.Svg('rect', {
							x: data.x+2,
							y: data.y+2,
							rx: 3,
							ry: 3,
							width: w-4,
							height: data.series[data.index].decimalHours*yScale-4,
							opacity: 1.0
						}, '');
						if (data.series[data.index].type == "hover") {
							newSvgElement.addClass('agenda-hover');
							newSvgElement.addClass('agenda-fade-in');
							newSvgElement.addClass('agenda-color-hover');
						} else {
							newSvgElement.addClass('agenda-color-'+data.series[data.index].colorIndex);
						}
						data.element.replace(newSvgElement);
						data.group.elem('text', {
							x: data.x+4,
							y: data.y+25, 
							fill: "white"
						}).text(
							data.series[data.index].courseName+" - "+data.series[data.index].name
						);
					}
				}
			};

			// Label interpolation function determines how our axes are labled.
			agenda.chartOptions = {
				seriesBarDistance: 0,
				showLine: false,
				axisY: {
					labelInterpolationFnc: function (value) {
						value = 24 - value;
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

			// Set columns on chart. Set series data to be nothing initially.
			agenda.chartData = {
				labels: ['Monday', 'Tuesday', 'Wednsday', 'Thursday', 'Friday'],
				series: []
			};
		}

		// Return blank agenda object, all set up and ready to be used.
		as.blankAgenda = function () {
			return agenda;
		}

		as.init();
	}
})();