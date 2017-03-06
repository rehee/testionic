
var churchInfo = require('./church/church.js');
(function () {
    angular.module('app').config(function (localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('ChurchApp'+churchInfo.church().church.name);
    })
})();
