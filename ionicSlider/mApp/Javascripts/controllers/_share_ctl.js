
(function () {
    angular.module('app').controller('shareCtl', ['$scope', '$log', '$state', 'churchService', 'deviceService', '$window', '$timeout', 'layoutService', 'contentService', 'localStorageService', shareCtl]);
    function shareCtl($scope, $log, $state, churchService, deviceService, $window, $timeout, layoutService, contentService, localStorageService) {
        var vm = this;
        vm.menus = contentService.menus;
        vm.user = contentService.userInfo;
        console.log(vm.menus);
        console.log('--');
        vm.width = deviceService.width();
        vm.c = function () {
            alert();
        }
        vm.layout = layoutService.layout;
        try {
            var timeNow = new Date().getTime();
            var timeSpend = timeNow - localStorageService.get('lastUpdated');
            if (!localStorageService.get('lastUpdated') || isNaN(timeSpend) || timeSpend > 600000) {
                contentService.refreshContent().then(
                    function (response) {
                        console.log('new content');
                    },
                    function () {
                        console.log('-')
                    }
                )
            }
        } catch (e) {
            console.log(e)
        }


        $window.onresize = function (event) {
            $timeout(function () {
                vm.width = deviceService.width();
            });
        };
        vm.textClass = 'no_height';
        vm.onHammer = function (event, index) {
            if (event == 'start') {
                vm.textClass = '';
            } else if (event == 'finish') {
                vm.textClass = 'no_height';
            } else if (event == 'tap') {
                vm.textClass = '';
                $timeout(function () {
                    vm.textClass = 'no_height';
                });
                console.log('logout');
                $state.go('home.' + vm.menus[index].href);
                try {
                    for (let i = 0; i < vm.menus.length; i++) {
                        if (i == index) {
                            vm.menus[i].tabActive = "active";
                        } else {
                            vm.menus[i].tabActive = "";
                        }
                    }
                } catch (e) {
                    console.log(e);
                }

            }
        }
    }
})();
