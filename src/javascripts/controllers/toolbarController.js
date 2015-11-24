(function () {
	"use strict";

	angular
		.module('scheedule')
		.controller('ToolbarController', ['$rootScope',ToolbarController]);

	function ToolbarController ($rootScope) {
		var tc = this;
		tc.init = function () {
			console.log("Loaded toolbar controller.");
		};

		tc.clickOpenSave = function () {
			$rootScope.$broadcast('openSaveSchedule');
		};

		tc.clickConfirmSave = function () {
			$rootScope.$broadcast('confirmSaveSchedule');
		};

		tc.clickOpenManage = function () {
			$rootScope.$broadcast('openManageSchedules');
		};

		tc.clickCloseManage = function () {
			$rootScope.$broadcast('closeManageSchedules');
		};

		tc.init();
	}
})();