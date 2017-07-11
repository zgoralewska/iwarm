/**
 * Created by DELL on 2016-01-31.
 */
"use strict";

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        Email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true
            }
        },
        Password: {
            type: DataTypes.STRING
        },
        Active: {
            type: DataTypes.INTEGER(1)
        },
        House_id: {
            type: DataTypes.INTEGER
        },
        Status: {
            type: DataTypes.STRING
        }
    }, {
        classMethods: {
            associate: function(models) {
                User.belongsTo(models.House,  {foreignKey: 'House_id'});
            }
        },
        instanceMethods: {

        },
        tableName: 'Users'
    });


    return User;
};
