require('./lib/ionic/js/ionic.bundle.js');
//require('./lib/ionic/css/ionic.css');
// require('angular-animate');
// require('angular-material');
var app = angular.module('app', ['ionic', 'ngMaterial']);

app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});


require('./controllers/_root_ctrl.js');


require('./route.js');