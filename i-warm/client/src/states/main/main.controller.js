/**
 * Created by DELL on 2016-03-26.
 */
(function () {
    'use strict';

    angular.module('app.states.main')
        .controller('MainController', MainController);

    MainController.$inject = ["$location", "Auth", "Email", "$rootScope"];

    /////////////////////

    function MainController($location, Auth, Email, $rootScope) {
        var vm = this;

        vm.test = "main";
        vm.msgRegister = "";
        vm.msgRegisterClass = "";
        vm.msgLogin = "";
        vm.msgLoginClass = "";
        vm.user = {email: '', password: '', passwordRepeat: ''};

        //Login
        vm.login = function(form, user) {
            if(form.$valid) {
                // call login from service
                Auth.login(user.email, user.password)
                    // handle success
                    .then(function () {
                        $rootScope.auth.pass = true;
                        $location.path('/dashboard');
                    })
                    // handle error
                    .catch(function () {
                        console.log("Login failed");
                        vm.msgLogin = "Login failed";
                        vm.msgLoginClass = "alert label";
                    });
            }
            console.log("login", user);
        };

        //Register
        vm.register = function(form, user) {
            var response = "";

            if(form.$valid) {
                vm.user = angular.copy(user);

                Auth.register(user.email, user.password)
                    // handle success
                    .then(function () {
                        response = Email.postEmail({email: user.email});
                        response.then(function(){
                            vm.msgRegister = response.$$state.value;
                            vm.msgRegisterClass = "success label";
                        });
                    })
                    // handle error
                    .catch(function () {
                        vm.msgRegister = "Problem occurred. Registration failed";
                        vm.msgRegisterClass = "alert label";
                    });
            }

            console.log("register", user);
        };
    }
})();