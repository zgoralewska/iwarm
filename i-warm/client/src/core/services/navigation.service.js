(function () {
    'use strict';

    angular.module('app.services')
        .factory('Navigation', Navigation);

    /////////////////////

    function Navigation() {
        var factory = {
            list: [
                {
                    name: 'Dashboard',
                    state: 'root.dashboard'
                }
            ]
        };

        return factory;
    }
})();