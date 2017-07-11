(function () {
    'use strict';

    angular.module('app.config')
        .config(defaultPage);

    /////////////////////

    function defaultPage($urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
    }
})();