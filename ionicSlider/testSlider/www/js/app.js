// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','tabSlideBox'])

.run(['$ionicPlatform','$q', '$http', '$rootScope', '$location', '$window', '$timeout',function($ionicPlatform,$q, $http, $rootScope, $location, $window, $timeout) {
  $ionicPlatform.ready(function() {
	// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
	// for form inputs)
	if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
	  cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
	  cordova.plugins.Keyboard.disableScroll(true);

	}
	if (window.StatusBar) {
	  // org.apache.cordova.statusbar required
	  StatusBar.styleDefault();
	}
  });

   $rootScope.$on("$locationChangeStart", function(event, next,current){
			$rootScope.error = null;
			console.log("Route change!!!", $location.path());
			var path = $location.path();


			console.log("App Loaded!!!");
		});

}])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
	.state('tab', {
	url: '/tab',
	abstract: true,
	templateUrl: 'templates/tabs.html',
  controller:'IndexCtrl'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
	url: '/dash',
	views: {
	  'tab-dash': {
		templateUrl: 'templates/tab-dash.html',
		controller: 'DashCtrl'
	  }
	}
  })

  .state('tab.chats', {
	  url: '/chats',
	  views: {
		'tab-chats': {
		  templateUrl: 'templates/tab-chats.html',
		  controller: 'ChatsCtrl'
		}
	  }
	})
	.state('tab.chat-detail', {
	  url: '/chats/:chatId',
	  views: {
		'tab-chats': {
		  templateUrl: 'templates/chat-detail.html',
		  controller: 'ChatDetailCtrl'
		}
	  }
	})

  .state('tab.account', {
	url: '/account',
	views: {
	  'tab-account': {
		templateUrl: 'templates/tab-account.html',
		controller: 'AccountCtrl'
	  }
	}
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});


app.controller("IndexCtrl", ['$rootScope', "$scope","$stateParams", "$q","$location", "$window", '$timeout',
function($rootScope, $scope, $stateParams, $q, $location, $window,$timeout){
 $scope.tabs = [
  {"text" : "Home"},
  {"text" : "Games"},
  {"text" : "Mail"},
  {"text" : "Car"},
  {"text" : "Profile"},
  {"text" : "Favourites"},
  {"text" : "Chats"},
  {"text" : "Settings"},
  {"text" : "Photos"},
  {"text" : "Pets"}
  ];
  $scope.onSlideMove = function(data){
  //alert("You have selected " + data.index + " tab");
  };
}]);
