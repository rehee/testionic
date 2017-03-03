
(function () {
    angular.module('app').controller('shareCtl', ['$scope', '$log', '$state', 'churchService', shareCtl]);
    function shareCtl($scope, $log, $state, churchService) {
        var vm = this;
        vm.menus = churchService.church.init.menu.public;


        $scope.$parent.myScrollOptions = {
            'wrapper': {
                snap: false,
                hScrollbar: true,
                onScrollEnd: function () {
                    alert('finshed scrolling wrapper');
                }
            },
        };

        $scope.refreshiScroll = function () {
            $scope.$parent.myScroll['wrapper'].refresh();
            alert('wrapper refreshed');
        };
    }
})();