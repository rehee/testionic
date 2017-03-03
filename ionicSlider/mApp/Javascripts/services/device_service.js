
(function () {
    angular.module('app').factory('deviceService',[deviceService]);
    function deviceService(){
        var device = null;
        var realDevice = false;
        function initDevice(realDevice,deviceInfo){
            this.realDevice=realDevice;
            this.device=deviceInfo;
        }
        return{
            device:device,
            initDevice:initDevice
        }

    }
})();