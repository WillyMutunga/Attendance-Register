const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    schedule: {
        type: DataTypes.STRING,
        allowNull: false // e.g., "Mon-Fri 9am-5pm"
    },
    attendanceLink: {
        type: DataTypes.STRING,
        allowNull: true // URL to meeting or generic link
    }
});

module.exports = Class;
