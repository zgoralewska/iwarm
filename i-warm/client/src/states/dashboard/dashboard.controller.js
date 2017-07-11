(function () {
    'use strict';

    angular.module('app.states.dashboard')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ["House", "Dashboard", "Socketio", "$scope"];

    /////////////////////

    function DashboardController(House, Dashboard, Socketio, $scope) {
        var vm = this,
            houseId,
            timer;

        setDefaultDashboardValues();

        House.checkIfUserHasHouse()
            .then(function (value) {
                vm.new = value;
                if(value)
                    getAllData();

                console.log("checkIfUserHasHouse", value);

            })
            .catch(function () {
                console.log("checkIfUserHasHouse failed");
            });

        vm.changeTemp = function(direction){
            clearTimeout(timer);

            if(typeof vm.tempChosen === "string"){
                vm.tempChosen = 0;
            }

            if(direction)
                vm.tempChosen++;
            else
                vm.tempChosen--;

            timer = setTimeout(function() {
                Dashboard.updateChosenTemp(vm.tempChosen);
            }, 500);
        };

        vm.removeUserFromHouse = function(){
            House.removeInhabitant()
                .then(function () {
                    vm.new = false;
                    setDefaultDashboardValues();
                    console.log("removeInhabitant success");

                })
                .catch(function () {
                    console.log("removeInhabitant failed");
                });
        };

        vm.updateAntifrostTemp = function(temp){
            Dashboard.updateAntifrostTemp(temp);
        };


        $scope.$on('houseAdded', getAllData);

        Socketio.on('inhabitantStateChanged', function(data){
            getAllInhabitants(houseId);
            console.log("Angular got inhabitantStateChanged", data);
        });

        Socketio.on('tempChanged', function(data){
            vm.tempActual = data.temp;
            console.log("Angular got tempChanged");
        });

        function getAllData(){
            Dashboard.getAllData()
                .then(function(values){
                    houseId = values.houseId;
                    getAllInhabitants(houseId);

                    console.log(values);

                    vm.houseName = values.houseName || "Your house name";
                    vm.houseUniqueName = values.houseUniqueName || "house unique name";
                    vm.loggedUser = values.loggedUser || "your email";

                    vm.tempActual = values.tempActual || "...";
                    vm.tempChosen = values.tempChosen || "...";
                    vm.tempAntifrost = values.tempAntifrost;

                    Socketio.join(vm.houseUniqueName);
                })
                .catch(function () {
                    console.log("getAllData failed");
                });
        }

        function getAllInhabitants(houseId){
            Dashboard.getInhabitants(houseId)
                .then(function(inhValues){
                    vm.inhabitantsOutside = inhValues.inhabitantsOutside || [];
                    vm.inhabitantsInside = inhValues.inhabitantsInside || [];
                })
                .catch(function () {
                    console.log("getInhabitants failed");
                });

        }

        function setDefaultDashboardValues(){
            vm.houseName = "House name";
            vm.houseUniqueName = "";
            vm.loggedUser = "";

            vm.tempActual = "...";
            vm.tempChosen = "...";

            vm.inhabitantsOutside = [];
            vm.inhabitantsInside = [];
        }
    }
})();