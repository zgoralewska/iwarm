/**
 * Created by DELL on 2016-03-26.
 */
(function() {
    'use strict';

    var login = {
        bindings: {
            login: '&',
            msgLogin: '@',
            msgLoginClass: '@'
        },
        controller: 'MainController',
        controllerAs: '$ctrl',
        templateUrl: 'states/main/components/login.html'
    };

    angular.module('app.components')
        .component('login', login);

})();
