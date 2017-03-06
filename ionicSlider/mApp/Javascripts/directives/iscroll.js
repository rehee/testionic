angular.module("app").directive('iscrollDirective', iscrollDirective);
iscrollDirective.$inject = ['$timeout'];
function iscrollDirective($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
            $timeout(function () {
                console.log('#' + element.attr('id'));
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
            })
        }
    }
};
