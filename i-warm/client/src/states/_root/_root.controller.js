(function () {
    'use strict';

    angular.module('app.states._root')
        .controller('RootController', RootController);

    /////////////////////

    function RootController(Navigation, Auth, $rootScope) {
        var vm = this;

        vm.list = Navigation.list;
        $rootScope.auth = {};
        $rootScope.auth.pass = Auth.isLoggedIn() !== undefined;
    }
})();