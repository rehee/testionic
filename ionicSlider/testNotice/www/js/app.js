// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])

  .run(function ($ionicPlatform, $rootScope, $timeout, $cordovaLocalNotification) {
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
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
      $timeout(function () {
        $rootScope.$broadcast('onReminderAdded', 1, 1, 1);
      }, 10000);



    });
  });
(function () {
  app.controller('MyCtrl', ['$scope', '$rootScope', '$ionicPlatform', '$cordovaLocalNotification', MyCtrl]);
  function MyCtrl($scope, $rootScope, $ionicPlatform, $cordovaLocalNotification) {

    $scope.addMessage = function () {
      $cordovaLocalNotification.add({ message: 'Great app!' });
    };

    $scope.scheduleInstantNotification = function () {
      $cordovaLocalNotification.schedule({
        id: 1,
        text: 'Instant Notification',
        title: 'Instant'
      }).then(function () {
        alert("Instant Notification set");
      });
    };

    $scope.add = function () {
      var alarmTime = new Date();
      alarmTime.setMinutes(alarmTime.getMinutes() + 1);
      $cordovaLocalNotification.add({
        id: "1234",
        date: alarmTime,
        message: "This is a message",
        title: "This is a title",
        autoCancel: true,
        sound: null
      }).then(function () {
        console.log("The notification has been set");
      });
    };

    $scope.isScheduled = function () {
      $cordovaLocalNotification.isScheduled("1234").then(function (isScheduled) {
        alert("Notification 1234 Scheduled: " + isScheduled);
      });
    }

  }
})();


