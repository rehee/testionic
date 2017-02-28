// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', "ngCordova"])

  .run(function ($ionicPlatform, $cordovaPush) {
    $ionicPlatform.ready(function () {
      var iosConfig = {
        'badge': true,
        'sound': true,
        'alert': true,
      };
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);


      }

      if (window.cordova) {
        alert('start');
        try {
          $cordovaPush.register(iosConfig).then(function (result) {
            // Success
            // 注册成功之后，返回的result是device token，是推送通知时的用户设备标识，
            // 一般deivce token会与用户信息相关联保存到后台数据库中，
            var deviceToken = result;
            alert(11);
            //$http.post('http://server.com/', {user: 'LiLei', device_token: result})
          }, function (err) {
            alert('Registration error: ' + err)
          });
        } catch (e) {
          alert(e);
        }
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }


    });
  });

app.controller("ExampleController", function ($scope, $cordovaLocalNotification) {



});


