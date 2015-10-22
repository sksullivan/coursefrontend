(function () {
	"use strict";

	angular
		.module('scheedule')
		.controller('IndexController', IndexController)

	function IndexController () {
    	var index = this;

    	index.init = function () {
    		console.log("Loaded index controller.");

    		index.message = "Angular in action!";
    	}

    	index.init();
	}
})();