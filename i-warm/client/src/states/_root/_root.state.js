(function () {
    'use strict';

    var stateDeps = [];

    angular
        .module('app.states._root', stateDeps)
        .config(stateConfig);

    /////////////////////////

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('root', {
                abstract: true,
                views: {
                    'root': {
                        templateUrl: 'states/_root/_root.html',
                        controllerUrl: 'states/_root/_root.controller.js',
                        controller: 'RootController',
                        controllerAs: 'rootCtrl'
                    }
                }
            });


    }

})();
