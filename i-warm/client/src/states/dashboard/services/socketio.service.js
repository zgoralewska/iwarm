/**
 * Created by DELL on 2016-04-17.
 */
(function () {
    'use strict';

    angular.module('app.services')
        .factory('Socketio', Socketio);

    Socketio.$inject = ["$rootScope"];

    /////////////////////

    function Socketio($rootScope) {
        var socket = io.connect();

        function join(roomName){
            socket.emit("clientJoinRoom", {"roomName": roomName});
        }

        function on(eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;

                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        }

        return {
            on: on,
            join: join
        }
    }
})();


