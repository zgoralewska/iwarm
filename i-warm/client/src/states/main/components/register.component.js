/**
 * Created by DELL on 2016-03-26.
 */
(function() {
    'use strict';

    var register = {
        bindings: {
            register: '&',
            msgRegister: '@'
        },
        controller: 'MainController',
        controllerAs: '$ctrl',
        templateUrl: 'states/main/components/register.html'
    };

    angular.module('app.components')
        .component('register', register);

})();

