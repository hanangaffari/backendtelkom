const sequelize = require('sequelize');

const db = new sequelize("backendtelkom","root","",{
    dialect:"mysql"
});

db.sync({});

module.exports = db;