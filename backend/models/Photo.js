// models/Photo.js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Photo = sequelize.define('Photo', {
    id: {
        type: DataTypes.STRING, // assuming Unsplash sends a string id
        primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
});
  
module.exports = Photo;

  