/**
 * Created by DELL on 2016-03-26.
 */
(function() {
    'use strict';

    HouseModalController.$inject = ['$document', 'House', '$scope'];

    /////////////////////

    function HouseModalController($document, House, $scope) {
        var vm = this,
            houseName = "";

        vm.modalSelection = 1;
        vm.houseExisting = {uniqueName: ""};
        vm.houseNew = {radius: "", lat: "", lng: "", houseName: ""};


        //Add user to existing house
        vm.addUserToHouse = function(form, houseExisting){
            if(form.$valid) {
                House.addUserToHouse(houseExisting)
                    .then(function(){
                        vm.new = true;
                        vm.modalSelection = 1;
                        $scope.$emit("houseAdded");
                    })
                    .catch(function(){
                        form.existingUniqueName.$setValidity("idinvalid",false);
                    });
            }
        };

        //New house
        vm.addHouse = function(form, houseNew){
            var coordinates;

            if(form.$valid) {
                coordinates = JSON.parse(
                    $document
                    .find('marker')[0]
                    .attributes
                    .position
                    .value);

                houseNew.lat = coordinates[0];
                houseNew.lng = coordinates[1];
                houseNew.houseName = houseName;

                House.addHouse(houseNew).then(function(){
                    vm.new = true;
                    vm.modalSelection = 1;
                    $scope.$emit("houseAdded");
                });
            }
        };

        vm.setHouseName = function(name){
            houseName = name;
        }
    }

    var houseModal = {
        bindings: {
            modalSelection: "@",
            addUserToHouse: "&",
            addHouse: "&",
            houseExisting: "<",
            houseNew: "<",
            new: "="
        },
        controller: HouseModalController,
        controllerAs: '$ctrl',
        templateUrl: 'states/dashboard/components/houseModal.html'
    };

    angular.module('app.components')
        .component('houseModal', houseModal);

})();

