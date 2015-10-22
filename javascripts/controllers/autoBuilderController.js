(function () {
	"use strict";

	angular
		.module('scheedule')
		.controller('AutoBuilderController', AutoBuilderController)

	function AutoBuilderController () {
	    var ab = this;

	    ab.init = function () {
	    	console.log("Loaded auto builder controller.");
	    }

	    ab.init();
	}
})();