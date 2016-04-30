(function () {
	"use strict";

	angular
		.module('scheedule')
		.directive('resizeable',['$window', resizeable]);

		function resizeable ($window) {
			return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    function resize() {
                        scope.windowHeight = $window.innerHeight;
                        scope.windowWidth = $window.innerWidth;
                    }

                    resize();

                    angular.element($window).bind('resize', function() {
                        resize();
                        scope.$digest();
                    });
                }
			};
		};
})();

