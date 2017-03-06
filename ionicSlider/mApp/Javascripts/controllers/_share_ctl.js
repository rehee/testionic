
(function () {
    angular.module('app').controller('shareCtl', ['$scope', '$log', '$state', 'churchService', 'deviceService','$window','$timeout', shareCtl]);
    function shareCtl($scope, $log, $state, churchService, deviceService,$window,$timeout) {
        var vm = this;
        vm.menus = churchService.church.init.menu.public;
        vm.width = deviceService.width();
        vm.c = function () {
            alert();
        }
        $window.onresize = function (event) {
            $timeout(function () {
                vm.width = deviceService.width();
            });
        };
        vm.textClass='no_height';
        vm.onHammer = function (event) {
            if(event=='start'){
                vm.textClass='';
            }else if(event=='finish'){
                vm.textClass='no_height';
            }else if(event=='tap'){
                vm.textClass='';
                $timeout(function(){
                    vm.textClass='no_height';
                },2);
            }
        }
    }
})();
