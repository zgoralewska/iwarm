(function () {
    'use strict';

    angular.module('app.services')
        .factory('House', House);

    House.$inject = ["$http", "$q"];

    /////////////////////

    function House($http, $q) {

        function addUserToHouse(houseProperties){
            // create a new instance of deferred
            var deferred = $q.defer();

            // send a post request to the server
            $http.post('/api/house/user/add', houseProperties)
                // handle success
                .success(function (data, status) {
                    console.log('success');
                    if(status === 200){
                        deferred.resolve("User added to house");
                    } else {
                        deferred.reject("Given id does not not exist");
                    }
                })
                // handle error
                .error(function (data) {
                    deferred.reject("Something went wrong. User did not add to house");
                });

            // return promise object
            return deferred.promise;
        }

        function addHouse(houseProperties){
            // create a new instance of deferred
            var deferred = $q.defer();

            // send a post request to the server
            $http.post('/api/house/add', houseProperties)
                // handle success
                .success(function (data, status) {
                    if(status === 200){
                        deferred.resolve("House created");
                    } else {
                        deferred.reject();
                    }
                })
                // handle error
                .error(function (data) {
                    deferred.reject("Something went wrong. House not created");
                });

            // return promise object
            return deferred.promise;
        }

        function checkIfUserHasHouse(){
            var deferred = $q.defer();

            // send a post request to the server
            $http.get('/api/house/user')
                // handle success
                .success(function (data, status) {
                    if(status === 200){
                        deferred.resolve(data.status);
                    }
                })
                // handle error
                .error(function (data) {
                    deferred.reject("Something went wrong");
                });

            // return promise object
            return deferred.promise;
        }

        function removeInhabitant(){
            var deferred = $q.defer();

            // send a post request to the server
            $http.delete('/api/house/user/delete')
                // handle success
                .success(function (data, status) {
                    if(status === 200){
                        deferred.resolve();
                    }
                })
                // handle error
                .error(function (data) {
                    deferred.reject("Something went wrong");
                });

            // return promise object
            return deferred.promise;
        }

        return {
            addUserToHouse: addUserToHouse,
            addHouse: addHouse,
            checkIfUserHasHouse: checkIfUserHasHouse,
            removeInhabitant: removeInhabitant
        }
    }
})();


