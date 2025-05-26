const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const UserPhotos = sequelize.define('UserPhotos', {

},{
    timestamps: false // Disable timestamps if not needed
});

module.exports = UserPhotos;
