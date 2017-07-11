(function() {
    'use strict';

    var navigation = {
        bindings: {
            list: '<',
            logOut: '&'
        },
        controller: ['Auth', '$state', function(Auth, $state){
            var vm = this;
            vm.logOut = function(){
                Auth.logout().then(function() {
                    $state.go('root.main', {}, {reload: true});
                });
            };
        }],
        controllerAs: '$ctrl',
        template: '<ul>' +
                    '<li ng-repeat="state in ::$ctrl.list"><a ui-sref="{{state.state}}">{{state.name}}</a></li>' +
                    '<li><a ng-click="$ctrl.logOut()">Logout</a></li>' +
                '</ul>'
    };

    angular.module('app.components')
        .component('navigation', navigation);


})();