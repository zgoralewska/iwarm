/**
 * Created by DELL on 2016-02-01.
 */
var models  = require('../models'),
    handler = require('./handleClients');


//Sprawdzenie aktualnego statusu domu
//Update statusu mieszkanca
//Jesli status domu sie zmienil -> akcja
var checkStatus = {
    beforeStatus: '',
    houseId: null,
    houseHash: null,

    getActualHouseState: function(email, callback){
        var self = this;
        models.User.findOne({ where: {Email: email} }).then(function(user){
            if(user){
                models.House.findOne({ where: {Id: user.House_id} }).then(function(house){
                    self.houseId = house.Id;

                    models.HouseOnline.findOne({ where: {Id: house.House_Online_Id} }).then(function(houseOnline){
                        self.beforeStatus = houseOnline.Status;
                        self.houseHash = house.UniqueName;
                        callback();
                    });
                });
            }
        });
    },

    updateHouseState: function(state){
        var self = this;
        models.House.findOne({where: { Id : self.houseId}}).then(function(house){
            models.HouseOnline.update({Status: state}, {where: { Id : house.House_Online_Id}});
        });
    },

    getAllInhabitansState: function(){
        var self = this;

        models.User.findAll({where: {House_id: self.houseId}, attributes: ['Status']}).then(function(users){
            self.compareStates(users, self.beforeStatus);
        });
    },

    updateUserStatus: function(email, type){
        var self = this;

        models.User.update({Status: type}, {where: {Email : email}}).then(function(){
            self.getAllInhabitansState();
        });
    },

    compareStates: function(userStatus, homeStatus){
        var finalUserState = "",
            usersExited = [],
            usersEntered = [],
            order = 0,
            self = this,
            i;

        console.log("in compareStates " +JSON.stringify(userStatus));

        for(i=0; i < userStatus.length; i++){
            if(userStatus[i].Status === "Entered"){
                usersEntered.push(userStatus[i]);
            }
            else if(userStatus[i].Status === "Exited"){
                usersExited.push(userStatus[i]);
            }
        }

        if(usersEntered.length > 0){
            finalUserState = "Entered";
            order = 1;
        }
        else{
            finalUserState = "Exited";
            order = 0;
        }

        if(finalUserState !== homeStatus){
            self.updateHouseState(finalUserState);
            self.sendOrder(order);
        }
    },

    sendOrder: function(state){
        var self = this,
            boardId = handler.clientsHelper.getClientBoard(self.houseHash);

        if (boardId) {
            boardId.write(state.toString());
            console.log("Sending to arduino state:" + state.toString());
        }
    },

    init: function(email, type){
        var self = this;
        self.getActualHouseState(email, function(){self.updateUserStatus(email, type)});
    }

};

module.exports = function(io, tcpServer) {

    io.sockets.on('connection', function (socket) {
        console.log('A new user connected!');
        socket.emit('info', { msg: 'The world is round, there is no up or down.' });


        //WebBrowser client want to subscribe changes
        socket.on('clientJoinRoom', function(data){
            socket.join(data.roomName);
        });

        //Jesli user laczy sie po raz pierwszy dodaj go do jakiegos domu (room.join)
        socket.on('inhabitantAdd', function (data) {
            handler.clientsHelper.appendToClients({
                houseId: data.houseId,
                email: data.email,
                socketId: socket.id
            });
            socket.join(data.houseId);
        });

        //Android changed state - Entered or Exited
        socket.on('message', function (data) {

            console.log('Status changed!');
            var houseHash = data.houseId,
                email = data.email,
                type = data.type;

            checkStatus.init(email, type);
            socket.to(houseHash).emit('inhabitantStateChanged', {email: email, status: type});
        });

        socket.on('disconnect', function() {
            console.log('Socket.io server socket close: ' + socket.id);
            handler.clientsHelper.removeFromClients(socket.id);
        });
    });


    tcpServer.on('connection', function(socket) {
        console.log('connection established');

        socket.on('data', function(data) {
            console.log('DATA ' + socket.remoteAddress + ': ' + data);
            var sData = data.toString(),
                result = null,
                houseId;

            result = handler.arduinoHelper.handleIncomingMessage(sData);
            houseId = result.houseId;

            //Arduino registration
            if(sData.indexOf("Hallo") > -1){
                handler.clientsHelper.appendToClients({
                    houseId : houseId,
                    email: "arduino",
                    socketId: socket
                });
            }
            else if(sData.indexOf("Temp") > -1){
                var temp = result.temp;
                io.sockets.to(houseId).emit('tempChanged', {temp: temp});

                models.House.findOne({ where: {UniqueName: houseId} }).then(function(house){

                    console.log("House online id:" + house.House_Online_Id);
                    if(house.House_Online_Id){
                        models.HouseOnline.update({Actual_Temp: temp}, {where: { Id : house.House_Online_Id }});
                    }
                    else{
                        models.HouseOnline
                            .create({Actual_Temp: temp})
                            .then(function(houseOnline){
                                houseOnline.setHouse(house);
                            });
                    }
                });

            }
            //Arduino sending result of order
            else if(sData.indexOf("Order") > -1){
                io.sockets.to(houseId).emit('orderResponse', result);
            }

        });

        socket.on('close', function() {
            console.log('Tcp server socket close: ' + socket.remoteAddress);
            handler.clientsHelper.removeFromClients(socket);
        });
    });

    tcpServer.on('error', function (e) {
        console.log('Tcp server error: ' + e.code);
        setTimeout(function () {
            tcpServer.close();
            tcpServer.listen(7700, "zgoralewska.me");
        }, 1000);
    });
};
