
(function () {
    angular.module('app').factory('deviceService', ['$timeout', '$window', deviceService]);
    function deviceService($timeout, $window) {
        let thisDevice = {
            avaliable: true,
            platform: '',
            version: '',
            uuid: '',
            cordova: '',
            model: '',
            manufacturer: '',
            isVirtual: '',
            serial: ''
        };
        let realDevice = false;
        function initDevice(realDevice, deviceInfo) {
            realDevice = realDevice;
            thisDevice.avaliable = deviceInfo.avaliable;
            thisDevice.platform = deviceInfo.platform;
            thisDevice.platform = deviceInfo.platform;
            thisDevice.version = deviceInfo.version;
            thisDevice.uuid = deviceInfo.uuid;
            thisDevice.cordova = deviceInfo.cordova;
            thisDevice.model = deviceInfo.model;
            thisDevice.manufacturer = deviceInfo.manufacturer;
            thisDevice.isVirtual = deviceInfo.isVirtual;
            thisDevice.serial = deviceInfo.serial;
        }
        let width = function () {
            return $window.innerWidth;
        }
        let getWhoami = function () {
            let whoami = {};
            if (thisDevice) {
                whoami['device_model'] = thisDevice.model;
                whoami['device_platform'] = thisDevice.platform;
                whoami['device_version'] = thisDevice.version;
                whoami['uuid'] = thisDevice.uuid;
                whoami['device_ptoken'] = '';
            }
            return whoami;
        }

        
        return {
            device: thisDevice,
            initDevice: initDevice,
            width: width,
            getWhoami: getWhoami
        }

    }
})();
