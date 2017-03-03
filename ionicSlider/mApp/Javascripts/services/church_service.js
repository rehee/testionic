require('angular');
var churchInfo = require('../church/church.js');
(function () {
    angular.module('app').factory('churchService',[churchService]);
    function churchService(){
        var church = churchInfo.church();

        return{
            church:church
        }

    }
})();