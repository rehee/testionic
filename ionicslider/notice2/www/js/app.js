// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova']);

app.run(function ($ionicPlatform, $rootScope, $timeout, $window) {
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
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
    if (window.cordova) {
      cordova.plugins.notification.local.on("schedule", function (notification, state) {
        $rootScope.$broadcast("$cordovaLocalNotification:added", notification);
      }, $rootScope);
      cordova.plugins.notification.local.on("trigger", function (notification) {
        alert(JSON.stringify(notification));
      }, $rootScope)
    }

  });
})

app.controller('MyCtrl',
  ['$scope', '$rootScope', '$ionicPlatform', '$cordovaLocalNotification','component',
    function ($scope, $rootScope, $ionicPlatform, $cordovaLocalNotification,component) {
      try {
        $scope.add = function () {
          try {
            var alarmTime = new Date();

            alarmTime.setMinutes(alarmTime.getMinutes() + 1);
            $cordovaLocalNotification.add({
              id: "1234",
              date: alarmTime,
              message: "This is a message",
              title: "This is a title",
              autoCancel: true,
              sound: true
            }).then(function () {

            });
          } catch (e) {
            
          }

        };

        $scope.isScheduled = function () {
          try {
            $cordovaLocalNotification.isScheduled("1234").then(function (isScheduled) {
              // alert("Notification 1234 Scheduled: " + isScheduled);
              component.alert("Notification 1234 Scheduled: " + isScheduled,'event status','done');
            });
          } catch (e) {
            
          }

        }
      } catch (e) {

      }


      $scope.$on("$cordovaLocalNotification:added", function (e, notification) {
        component.alert('some event has been added','event added','done');
      });


    }]);


app.factory('component',[
  function(){
    function alert(message,title,button,callback){
      if(navigator){
        navigator.notification.alert(
            message,  // message
            callback,         // callback
            title,            // title
            button                  // buttonName
        );
      }else{
        alert(message)
      }
    }
    return {
      alert:alert
    }
  }]);