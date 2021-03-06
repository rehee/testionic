// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// require('./lib/ionic/js/ionic.bundle.js');
// require('iscroll');
 require('jquery');
// require('bootstrap');
require('ng-iscroll');
require('hammerjs');
require('angular-hammer');
require('angular-local-storage')
var app = angular.module('app', ['ionic', 'ng-iscroll','hmTouchEvents','LocalStorageModule']);
require('./services/church_service.js');
require('./services/device_service.js');
require('./directives/iscroll.js');
require('./services/layout_service.js');
require('./services/content_service.js');
app.run(function ($ionicPlatform, churchService, deviceService,layoutService) {
  $ionicPlatform.ready(function () {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (typeof (device) != 'undefined') {
      deviceService.initDevice(true, device);
    } else {
      let thisDevice = {
        avaliable: true,
        platform: 'Android',
        version: '6.0.',
        uuid: 'c9ba08b93c1bc08',
        cordova: '6.1.2',
        model: 'Nexus 7',
        manufacturer: 'asus',
        isVirtual: 'true',
        serial: '0793a2f4'
      };
      
      deviceService.initDevice(false, thisDevice);
     
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
    layoutService.layout.title = churchService.church.name;
    
  });
})
require('./localStorage.js')
require('./controllers/_share_ctl.js');
require('./controllers/home_ctl.js');
require('./route.js')


