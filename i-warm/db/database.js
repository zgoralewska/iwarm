/**
 * Created by DELL on 2016-01-31.
 */
var Sequelize = require('sequelize');
var sequelize = new Sequelize('iwarm', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log,
    define: {
        timestamps: false
    }
});

exports.defineModel = function(opts){
    sequelize.define(opts.tableName, opts.config, opts.methods);
};
