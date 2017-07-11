/**
 * Created by DELL on 2016-02-28.
 */
this.clientsHelper = {
    clients: [],

    removeFromClients: function(socketId){
        var i,
            index,
            self = this;

        index = getClientIndexBySocketId(socketId);

        if(index !== null){
            self.clients.splice(index, 1);
        }

        function getClientIndexBySocketId(socketId){
            for (i = 0; i < self.clients.length; i++) {
                if(self.clients[i].socketId === socketId){
                    return i;
                }
            }
        }
    },

    getClientBoard: function(houseId){
        var i,
            result = "",
            self = this;

        for (i = 0; i < self.clients.length; i++) {
            console.log("Clients:" + self.clients[i].houseId);
            if(self.clients[i].houseId === houseId && self.clients[i].email === "arduino"){
                result = self.clients[i].socketId;
            }
        }
        return result;
    },

    appendToClients: function(opts){
        //When email empty it is arduino
        var user = {
            houseId: opts.houseId || "",
            email: opts.email || "",
            socketId: opts.socketId || ""
        },
            self = this;

        console.log("Append to clients" + user);

        self.clients.push(user);

        //function containsObject(obj, list) {
        //    var i;
        //    for (i = 0; i < list.length; i++) {
        //        if (list[i] obj) {
        //            return true;
        //        }
        //    }
        //    return false;
        //}
    }
};

this.arduinoHelper = {
    getValue: function(msgLine, key, type){
        var result = "",
            indexOfStop,
            partOfString;

        if(type === "full"){
            result = msgLine.substring(msgLine.indexOf(key) + key.length, msgLine.length);
        }
        else{
            partOfString = msgLine.substring(msgLine.indexOf(key) + key.length, msgLine.length);
            indexOfStop = partOfString.indexOf('|');
            result = partOfString.substring(0, indexOfStop);
        }
        return result;
    },
    handleIncomingMessage: function(msg){
        var result = "",
            houseId = "",
            temp = "",
            tempOrder = "",
            self = this;

        if(msg.length){
            houseId = self.getValue(msg, "houseId=", "full");

            //Arduino registration
            if(msg.indexOf("Hallo") > -1){
                result = {houseId: houseId};
            }
            //Arduino sending actual temperature
            else if(msg.indexOf("Temp") > -1){
                temp = self.getValue(msg, "temp=");
                result = {temp: temp, houseId: houseId};
            }
            //Arduino sending result of order
            else if(msg.indexOf("Order") > -1){
                tempOrder = self.getValue(msg, "before=");
                temp = self.getValue(msg, "now=");
                result = {tempOrder: tempOrder, tempActual: temp, houseId: houseId};
            }
        }

        return result;
    }
};
