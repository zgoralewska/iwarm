(function () {
    'use strict';

    var stateDeps = [ ];

    angular
        .module('app.states.main', stateDeps)
        .config(stateConfig);

    /////////////////////////

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('root.main', {
                url: '/',
                views: {
                    'main@root': {
                        templateUrl: 'states/main/main.html',
                        controllerUrl: 'states/main/main.controller.js',
                        controller: 'MainController',
                        controllerAs: 'mainCtrl'
                    }
                }
            });


    }


})();
