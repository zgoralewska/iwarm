(function() {
    var deps = [
        'ui.router',
        'ngCookies',
        'ngMap',

        'foundation',
        // Routing with front matter
        'foundation.dynamicRouting',
        // Transitioning between views
        'foundation.dynamicRouting.animations',

        'app.config',
        'app.services',
        'app.components',
        'app.states'
    ];

    angular.module('app', deps)
        .run(['$rootScope', 'Auth', '$state', function ($rootScope, Auth, $state){
            //FastClick.attach(document.body);

            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
                if (Auth.isLoggedIn()){
                    if(toState.name === "root.main"){
                        event.preventDefault();
                        $state.go('root.dashboard', {}, {reload: true});
                    }
                }
                else{
                    if(toState.name !== "root.main"){
                        event.preventDefault();
                        $state.go('root.main', {}, {reload: true});
                    }
                }
            });
        }]);
})();