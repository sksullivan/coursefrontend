(function () {
	"use strict";

	angular
		.module('scheedule')
		.controller('ScheduleViewerController', ScheduleViewerController);

	/* @ngInject */
	function ScheduleViewerController () {
    	var viewer = this;

    	viewer.init = function () {
    		console.log("Loaded schedule view controller.");
    	}

    	init();
	}
})();