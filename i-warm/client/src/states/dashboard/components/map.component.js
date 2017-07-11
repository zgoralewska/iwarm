/**
 * Created by DELL on 2016-03-26.
 */
(function() {
    'use strict';

    /////////////////////

    MapInputController.$inject = ['$scope', 'NgMap'];

    function MapInputController($scope, NgMap) {
        var vm = this;

        vm.searchInput = "";

        NgMap.getMap().then(function(map) {
            $scope.map = map;
            $scope.map = {
                center: [52, 16],
                zoom: 5
            };

            $scope.marker = {
                position: [52, 16],
                decimals: 4
            };
        });

        vm.geoSearch = function (searchInput) {
            var geocoder;

            geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address': searchInput }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var loc = results[0].geometry.location,
                        coordinates = [loc.lat(), loc.lng()];

                    $scope.$apply(function(){
                        vm.searchInput = results[0].formatted_address;
                        vm.parentFormCtrl.setHouseName(vm.searchInput);
                        $scope.map.zoom = "8";
                        $scope.map.center = coordinates;
                        $scope.marker.position = coordinates;
                    });
                }
            });
        };
    }

    var mapInput = {
        bindings: {
            map: "<",
            marker: "<",
            searchInput: "<",
            geoSearch: "&"
        },
        require: {
            parentFormCtrl: '^houseModal'
        },
        controller: MapInputController,
        controllerAs: '$ctrl',
        templateUrl: 'states/dashboard/components/map.html'
    };

    angular.module('app.components')
        .component('mapInput', mapInput);

})();


