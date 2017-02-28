require('angular');
(function () {
    angular.module('app').config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '../views/share/_root.html'
            })
            .state('home.list', {
                url: '/list',
                views: {
                    'tab-lll': {
                        templateUrl: '../views/list/list.html'
                    }
                }

            })

            ;
        $urlRouterProvider.otherwise('/home');
    })
})();