(function () {
    "use strict";
    
    angular
        .module('scheedule')
        .directive('resize', resize)

    function resize ($window) {
        return function (scope, element) {
            var w = angular.element($window);
            scope.getWindowHeight = function () {
                return w.height();
            };
            scope.$watch(scope.getWindowHeight, function (newValue, oldValue) {
                scope.style = function () {
                    return  { 
                        'height': (newValue - 80) + 'px'
                    };
                };
            }, true);
            w.bind('resize', function () {
                scope.$apply();
            });
        }
    }
})();