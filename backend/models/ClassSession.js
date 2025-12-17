const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClassSession = sequelize.define('ClassSession', {
    topic: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE, // Optional
        allowNull: true
    },
    meetingLink: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = ClassSession;
