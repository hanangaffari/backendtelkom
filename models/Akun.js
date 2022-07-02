const sequelize = require('sequelize');
const db = require('../config/db');

const Akun = db.define(
    "Akun",
    {
        nama:{type:sequelize.STRING},
        nip:{type:sequelize.INTEGER},
        mata_kuliah:{type:sequelize.STRING},
        username:{type:sequelize.STRING},
        password:{type:sequelize.STRING},
        role:{type:sequelize.STRING},
        jadwal:{type:sequelize.STRING},
    },
    {
        freezeTableName : true
    }
);


module.exports = Akun;