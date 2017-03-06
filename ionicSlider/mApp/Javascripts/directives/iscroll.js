angular.module("app").directive('iscrollDirective', iscrollDirective);
iscrollDirective.$inject = ['$timeout','$interval','contentService'];
function iscrollDirective($timeout,$interval,contentService) {
    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
            function refeesh(){
                var iscrollwrapper = new IScroll('#' + element.attr('id'), {
                    scrollX: true,
                    scrollY: false,
                    mouseWheel: true,
                    scrollbars: false,
                    useTransform: true,
                    useTransition: false,
                    eventPassthrough: true,
                });
                iscrollwrapper.refresh();
            };
            $timeout(refeesh);
            let lastStatus = contentService.userInfo.isLogin;
            $interval(function(){
                let currentStatus =contentService.userInfo.isLogin;
                if(lastStatus!=currentStatus){
                    alert("change");
                    lastStatus=currentStatus;
                    refeesh();
                }
            },100);
        }
    }
};
