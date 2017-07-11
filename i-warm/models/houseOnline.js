/**
 * Created by DELL on 2016-02-29.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var HouseOnline = sequelize.define("HouseOnline", {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        Actual_Temp: {
            type: DataTypes.DOUBLE
        },
        Preferable_Temp: {
            type: DataTypes.DOUBLE
        },
        Antifrost_Temp: {
            type: DataTypes.DOUBLE
        },
        Heat_Status: {
            type: DataTypes.INTEGER
        },
        Status: {
            type: DataTypes.STRING
        }
    }, {
        classMethods: {
            associate: function(models) {
                HouseOnline.hasOne(models.House, {as: 'House', foreignKey : 'House_Online_Id'});
            }
        },
        instanceMethods: {

        },
        tableName: 'Houses_Online'
    });


    return HouseOnline;
};

