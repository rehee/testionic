
(function () {
    angular.module('app').config(function ($stateProvider, $urlRouterProvider) {


        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'views/share/_root.html'
            })
            .state('home.home', {
                url: '/home',
                views: {
                    'body': {
                        templateUrl: 'views/home/home.html'
                    }
                }
            })
            .state('home.logout', {
                url: '/home',
                views: {
                    'body': {
                        templateUrl: function(){
                            
                            return 'views/home/home.html';
                        },
                        controller:function(contentService){
                            contentService.logout().then(
                                function(){
                                    console.log('logout');
                                }
                            );
                        }
                    }
                }
            })
            ;
        $urlRouterProvider.otherwise('/home/home');
    })
})();
