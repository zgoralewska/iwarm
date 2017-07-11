(function () {
    'use strict';

    angular.module('app.services')
        .factory('Email', Email);

    Email.$inject = ["$http", "$q"];

    /////////////////////

    function Email($http, $q) {

        return {
            postEmail: function (emailData) {
                var deferred = $q.defer();

                $http.post("api/email/", emailData)
                    .then(function () {
                        deferred.resolve("Activation email has been sent");
                    })
                    // handle error
                    .error(function (data) {
                        deferred.reject();
                    });

                // return promise object
                return deferred.promise;
            }
        }
    }
})();

