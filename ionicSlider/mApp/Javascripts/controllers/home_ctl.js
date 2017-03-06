require('angular');
(function () {
    angular.module('app').controller('homeCtl', ['layoutService', 'contentService', 'deviceService', homeCtl]);
    function homeCtl(layoutService, contentService, deviceService) {
        layoutService.layout.title = 'HOME';

        var vm = this;
        vm.isLoading = false;
        vm.content = contentService.getContent('home');
        vm.refresh = function () {
            refreshContent();
        }
        vm.loginModule={
            userEmail:'',
            userPass:''
        }
        vm.user = contentService.userInfo;
        vm.login = function(){
            contentService.userLogin(vm.loginModule).then(
                function(){
                    vm.loginMark = "";
                },
                function(){
                    console.log('error');
                }
            );
        }
        vm.getImageHeight = function (height) {
            let calc_width = parseInt(deviceService.width() - 20);
            let calc_height = calc_width / parseFloat(height);
            return calc_height;
        }
        vm.loginMark = "";
        vm.showLogin = function (isShowing) {
            if (isShowing) {
                vm.loginMark = "show";
            } else {
                vm.loginMark = "";
            }

        }

        function refreshContent() {
            vm.isLoading = true;
            contentService.refreshContent().then(
                function () {
                    vm.isLoading = false;
                    vm.content = contentService.getContent('home');
                    console.log(vm.content);
                },
                function () {
                    vm.isLoading = false;
                }
            );
        }
        if (!vm.content) {
            refreshContent();
        }
        console.log(vm.content)

    }
})();