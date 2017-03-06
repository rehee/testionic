require('angular');
(function () {
    angular.module('app').factory('layoutService', [layoutService]);
    function layoutService() {
        var layout ={
            title:'app'
        };

        return{
            layout:layout
        }
    }
})();