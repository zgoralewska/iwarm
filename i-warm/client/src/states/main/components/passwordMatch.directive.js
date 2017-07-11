/**
 * Created by DELL on 2016-04-04.
 */
(function() {
    'use strict';

    var passwordMatch = function(){
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=passwordMatch"
            },
            link: function(scope, element, attributes, ngModel) {

                ngModel.$validators.passwordMatch = function(modelValue) {
                    return modelValue == scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    };

    angular.module('app.components')
        .directive('passwordMatch', passwordMatch);

})();
