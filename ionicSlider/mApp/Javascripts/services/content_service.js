require('angular');
(function () {
    angular.module('app').factory('contentService', ['$q', '$http', 'churchService', 'deviceService', 'localStorageService', contentService]);
    function contentService($q, $http, churchService, deviceService, localStorageService) {
        let baseUrl = churchService.church.init.base_url;
        let churchId = churchService.church.init.church_id;
        let userInfo = {
            userFirstName: localStorageService.get('firstname'),
            userLastName: localStorageService.get('lastname'),
            userAppId: localStorageService.get('loggedInUser')
        };
        userInfo.isLogin = (!isNaN(userInfo.userAppId) && userInfo.userAppId > 0);
        let menus = [];
        var menuIScroller = { a: {} };
        
        function getMenus(menu) {
            menu.splice(0, menu.length)
            for (let item of churchService.church.init.menu.public) {
                if (item.private == false || userInfo.isLogin==true)  {
                    menu.push(item);
                }
            }
            
        }
         getMenus(menus);
         console.log(menus)
        // let userFirstName = localStorageService.get('firstname');
        // let userLastName = localStorageService.get('lastname');
        // let userAppId = localStorageService.get('loggedInUser');
        // let userLogin = false;

        function refreshContent() {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: baseUrl + '/app/all',
                data: deviceService.getWhoami(),
                dataType: 'json',
                headers: { 'iknow-api-key': localStorageService.get('api_key') },
            }).then(function successCallback(response) {
                if (response.data.status) {
                    localStorageService.set('lastUpdated', new Date().getTime())
                    localStorageService.set('api_key', response.data.auth.key)
                    //console.log(response.data);
                    for (let [key, value] of Object.entries(response.data.data)) {
                        localStorageService.set(key, value)
                    }
                    deferred.resolve(response);
                }
                deferred.reject();
            }, function errorCallback(response) {
                deferred.reject();
            });
            return deferred.promise;
        }

        function userLogin(loginModule) {
            if (!localStorageService.get('api_key')) {
                refreshContent().then(
                    function () {
                        console.log('refresh key');
                        userLogin(loginModule);
                    },
                    function () {
                        console.log('refresh key fail');
                    }
                )
                return;
            }
            var deferred = $q.defer();
            var post = new Object;
            post['email'] = loginModule.userEmail;
            post['password'] = loginModule.userPass;
            $http({
                method: 'POST',
                url: baseUrl + '/auth/login',
                data: post,
                dataType: 'json',
                headers: { 'iknow-api-key': localStorageService.get('api_key') },
            }).then(function successCallback(response) {
                if (response.data.auth.status) {
                    localStorageService.set('firstname', response.data.data.ppl_fname);
                    localStorageService.set('lastname', response.data.data.ppl_sname);
                    localStorageService.set('loggedInUser', response.data.data.ppl_id);

                    userInfo.userFirstName = localStorageService.get('firstname');
                    userInfo.userLastName = localStorageService.get('lastname');
                    userInfo.userAppId = localStorageService.get('loggedInUser');
                    userInfo.isLogin = true
                    for (let item of menus) {
                        item.displayMenu = true;
                    }
                    
                    getMenus(menus);
                    refreshContent().then(
                        function () {
                            console.log('refresh content');

                        },
                        function () {
                            console.log('refresh content fail');
                        }
                    )
                    deferred.resolve();
                }
                deferred.reject(response);
            }, function errorCallback(response) {
                deferred.reject();
            });

            return deferred.promise;
        }

        function logout() {
            menus[0].tabActive = "active";
            if (!localStorageService.get('api_key')) {
                refreshContent().then(
                    function () {
                        console.log('refresh key');
                    },
                    function () {
                        console.log('refresh key fail');
                    }
                )
                localStorageService.set('firstname', '');
                localStorageService.set('lastname', '');
                localStorageService.set('loggedInUser', '');
                userInfo.isLogin = false;

                userInfo.userFirstName = localStorageService.get('firstname');
                userInfo.userLastName = localStorageService.get('lastname');
                userInfo.userAppId = localStorageService.get('loggedInUser');
            }
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: baseUrl + '/app/all?logout=true',
                data: deviceService.getWhoami(),
                dataType: 'json',
                headers: { 'iknow-api-key': localStorageService.get('api_key') },
            }).then(function successCallback(response) {
                console.log(response);
                localStorageService.set('api_key', response.data.auth.key);
                localStorageService.set('firstname', '');
                localStorageService.set('lastname', '');
                localStorageService.set('loggedInUser', '');
                userInfo.userFirstName = localStorageService.get('firstname');
                userInfo.userLastName = localStorageService.get('lastname');
                userInfo.userAppId = localStorageService.get('loggedInUser');
                userInfo.isLogin = false;
                refreshContent().then(
                    function () {
                        console.log('refresh content');

                    },
                    function () {
                        console.log('refresh content fail');
                    }
                )
                getMenus(menus);
                
            }, function errorCallback(response) {
                deferred.reject();
            });

            return deferred.promise;


        }

        function getContent(key) {
            return localStorageService.get(key);
        }
        return {
            refreshContent: refreshContent,
            getContent: getContent,
            userLogin: userLogin,
            logout: logout,
            userInfo: userInfo,
            menus: menus,
            menuIScroller: menuIScroller
        }
    }
})();

