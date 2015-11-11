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

		tc.clickSave = function () {
			$rootScope.$broadcast('saveScheedule');
		};

		tc.clickLoad = function () {
			$rootScope.$broadcast('loadScheedule');
		};

		tc.init();
	}
})();