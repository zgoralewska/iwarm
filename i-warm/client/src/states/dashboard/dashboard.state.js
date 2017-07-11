(function () {
    'use strict';

    var stateDeps = [];

    angular
        .module('app.states.dashboard', stateDeps)
        .config(stateConfig);

    /////////////////////////

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('root.dashboard', {
                url: '/dashboard',
                views: {
                    'main@root': {
                        templateUrl: 'states/dashboard/dashboard.html',
                        controllerUrl: 'states/dashboard/dashboard.controller.js',
                        controller: 'DashboardController',
                        controllerAs: 'dashboardCtrl'
                    }
                }
            });


    }

})();
