const sequelize = require('sequelize');
const db = require('../config/db');

const makul = db.define(
    "matakuliah",
    {
        mata_kuliah:{type:sequelize.STRING},
        mahasiswa:{type:sequelize.TEXT('large')},
        dosen:{type:sequelize.STRING},
        jadwal:{type:sequelize.STRING},  

    },
    {
        freezeTableName : true
    }
);


module.exports = makul;