const sequelize = require('../config/database');
const User = require('./User');
const Class = require('./Class');
const Attendance = require('./Attendance');
const ClassSession = require('./ClassSession');
const Notification = require('./Notification');

// User <-> Class (Many-to-Many Enrollment)
User.belongsToMany(Class, { through: 'UserClasses' });
Class.belongsToMany(User, { through: 'UserClasses' });

// User -> Attendance (One-to-Many)
User.hasMany(Attendance);
Attendance.belongsTo(User);

// Class -> Attendance (One-to-Many)
Class.hasMany(Attendance);
Attendance.belongsTo(Class);

// Class -> ClassSession (One-to-Many)
Class.hasMany(ClassSession, { as: 'Sessions' });
ClassSession.belongsTo(Class);

// User -> Notification
User.hasMany(Notification);
Notification.belongsTo(User);

module.exports = {
    sequelize,
    User,
    Class,
    Attendance,
    ClassSession,
    Notification
};
