
(function () {
    angular.module('app').factory('deviceService', ['$timeout', '$window', deviceService]);
    function deviceService($timeout, $window) {
        var device = null;
        var realDevice = false;
        function initDevice(realDevice, deviceInfo) {
            this.realDevice = realDevice;
            this.device = deviceInfo;
        }
        let width = function (){
            return $window.innerWidth;
        }
        return {
            device: device,
            initDevice: initDevice,
            width: width
        }

    }
})();
