(function () {
    'use strict';

    angular.module('app.services')
        .factory('Dashboard', Dashboard);

    Dashboard.$inject = ["$http", "$q"];

    /////////////////////

    function Dashboard($http, $q) {

        function getAllData(){
            var deferred = $q.defer();

            $http.get('/api/dashboard')
                .success(function (data, status) {
                    if(status === 200){
                        deferred.resolve(data.status);
                    }
                })
                .error(function (data) {
                    deferred.reject("Something went wrong");
                });
            return deferred.promise;
        }

        function getInhabitants(houseId){
            var deferred = $q.defer();

            console.log("getinhabitants", houseId);

            // send a post request to the server
            $http.get('/api/dashboard/inhabitants/' + houseId)
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

        function updateChosenTemp(chosenTemp){
            var deferred = $q.defer();

            // send a post request to the server
            $http.post('/api/dashboard/temp/', {'temp': chosenTemp})
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

        function updateAntifrostTemp(temp){
            var deferred = $q.defer();

            $http.post('/api/dashboard/temp/antifrost', {'temp': temp})
                .success(function (data, status) {
                    if(status === 200){
                        deferred.resolve(data.temp);
                    }
                })
                .error(function (data) {
                    deferred.reject("Something went wrong");
                });
            return deferred.promise;
        }

        return {
            getAllData: getAllData,
            updateChosenTemp: updateChosenTemp,
            getInhabitants: getInhabitants,
            updateAntifrostTemp: updateAntifrostTemp
        }
    }
})();




