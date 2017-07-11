(function () {
    'use strict';

    angular.module('app.services')
        .factory('Auth', Auth);

    Auth.$inject = ["$q", "$http", "$cookies"];

    /////////////////////

    function Auth($q, $http, $cookies) {
        var user = false;

        function isLoggedIn() {
            return $cookies.get("connect.sid");
        }

        function login(email, password) {

            // create a new instance of deferred
            var deferred = $q.defer();

            // send a post request to the server
            $http.post('/api/login',
                {email: email, password: password})
                // handle success
                .success(function (data, status) {
                    if(status === 200 && data.status){
                        user = true;
                        deferred.resolve();
                    } else {
                        user = false;
                        deferred.reject();
                    }
                })
                // handle error
                .error(function (data) {
                    user = false;
                    deferred.reject();
                });

            // return promise object
            return deferred.promise;

        }

        function logout() {

            // create a new instance of deferred
            var deferred = $q.defer();

            // send a get request to the server
            $http.get('/api/logout')
                // handle success
                .success(function (data) {
                    user = false;
                    deferred.resolve();
                })
                // handle error
                .error(function (data) {
                    user = false;
                    deferred.reject();
                });

            // return promise object
            return deferred.promise;

        }

        function register(email, password) {

            // create a new instance of deferred
            var deferred = $q.defer();

            // send a post request to the server
            $http.post('/api/register',
                {email: email, password: password})
                // handle success
                .success(function (data, status) {
                    if(status === 200 && data.status){
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                })
                // handle error
                .error(function (data) {
                    deferred.reject();
                });

            // return promise object
            return deferred.promise;

        }

        // return available functions for use in the controllers
        return ({
            isLoggedIn: isLoggedIn,
            login: login,
            logout: logout,
            register: register
        });
    }
})();
