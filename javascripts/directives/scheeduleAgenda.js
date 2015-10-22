(function () {
    "use strict";
    
    angular
        .module('scheedule')
        .directive('ngScheeduleAgenda', ngScheeduleAgenda)
    
    function ngScheeduleAgenda ($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'templates/scheeduleAgenda.html',
            scope: {
                chartEvents: '=chartEvents',
                events: '=events'
            },
            link: function postLink(scope, element, attrs) {
                
            }
        }
    }
})();