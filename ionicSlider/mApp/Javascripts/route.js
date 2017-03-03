
(function () {
    angular.module('app').config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '../views/share/_root.html'
            });
        $urlRouterProvider.otherwise('/home');
    })
})();