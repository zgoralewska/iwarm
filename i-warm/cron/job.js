var handler = require('../socketio/handleClients');

function startCrone(cron, models){
    //Check for every Entered house if tempActual > or < than tempWanted
    var steps = {

        getHouses: function(flag){
            var self = this;

            models.HouseOnline.findAll({
                where: {Status: flag},
                include: [{
                    model: models.House,
                    as: 'House'
                }]
                }).then(function(houses){
                    self.checkTemperatures(houses, flag);
            });
        },

        checkTemperatures: function(houses, flag){
            var self = this,
                result = [],
                i,
                preferableTemp = 0,
                antifrostTemp = 0,
                actualTemp = 0,
                state = 0,
                houseId,
                houseHash = null,
                aim;

            for(i=0; i<houses.length; i++){
                preferableTemp = houses[i].Preferable_Temp;
                antifrostTemp = houses[i].Antifrost_Temp;
                actualTemp = houses[i].Actual_Temp;
                state = houses[i].Heat_Status;
                houseId = houses[i].Id;

                if(houses[i].House)
                    houseHash = houses[i].House.UniqueName;

                if(flag === "Entered")
                    aim = preferableTemp;
                else
                    aim = antifrostTemp;

                if(actualTemp < aim && state[0] !== 1){
                    result.push({id: houseId, houseHash: houseHash, changeState: 1});
                }
                else if(actualTemp > aim && state[0] !== 0){
                    result.push({id: houseId, houseHash: houseHash, changeState: 0});
                }
            }
            self.changeState(result);
        },

        changeState: function(result){
            var i,
                self = this;

            for(i=0; i<result.length; i++){
                models.HouseOnline.update({Heat_Status: result[i].changeState}, {where: { Id : result[i].id}});
                self.sendOrder(result[i].changeState, result[i].houseHash);
            }
        },

        sendOrder: function(state, houseHash){
            console.log("HouseHash:"+houseHash);

            if(!houseHash)
                return;

            var boardId = handler.clientsHelper.getClientBoard(houseHash);

            console.log("BoardId:"+boardId);
            if (boardId) {
                boardId.write(state.toString());
                console.log("Sending to arduino state:" + state.toString());
            }
        },

        check: function(){
            var self = this;

            self.getHouses("Entered");
            self.getHouses("Exited");
        }
    };


    var cronJob = cron.job("*/35 * * * * *", function(){
        console.log('cron job completed');
        steps.check();
    });

    cronJob.start();
}

module.exports.startCrone = startCrone;