const sequelize = require('./config/database');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await sequelize.sync();

        const adminEmail = 'admin@moringa.com';
        const adminPassword = 'admin123'; // Change this contextually or warn user

        const existingAdmin = await User.findOne({ where: { email: adminEmail } });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }

        await User.create({
            name: 'Admin User',
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        });

        console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        process.exit();
    }
};

seedAdmin();
