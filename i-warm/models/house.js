/**
 * Created by DELL on 2016-02-04.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var House = sequelize.define("House", {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        Name: {
            type: DataTypes.STRING
        },
        Lat: {
            type: DataTypes.DOUBLE
        },
        Lng: {
            type: DataTypes.DOUBLE
        },
        Radius: {
            type: DataTypes.DOUBLE
        },
        House_Online_Id: {
            type: DataTypes.INTEGER
        },
        UniqueName: {
            type: DataTypes.STRING
        }
    }, {
        classMethods: {
            associate: function(models) {
                House.belongsTo(models.HouseOnline,  {foreignKey: 'House_Online_Id'});
                House.hasMany(models.User, {as: 'Inhabitants', foreignKey: 'House_id'});
            }
        },
        instanceMethods: {

        },
        tableName: 'Houses'
    });

    return House;
};
