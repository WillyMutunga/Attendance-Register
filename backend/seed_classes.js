const { sequelize, Class } = require('./models');

const seedClasses = async () => {
    try {
        await sequelize.sync({ alter: true });

        const classes = [
            {
                name: 'Artificial Intelligence',
                schedule: 'Mon/Wed 10:00 AM - 12:00 PM',
                attendanceLink: 'https://meet.google.com/ai-class'
            },
            {
                name: 'Software Engineering',
                schedule: 'Tue/Thu 2:00 PM - 4:00 PM',
                attendanceLink: 'https://meet.google.com/se-class'
            },
            {
                name: 'Data Science',
                schedule: 'Fri 9:00 AM - 12:00 PM',
                attendanceLink: 'https://meet.google.com/ds-class'
            }
        ];

        for (const c of classes) {
            const [clazz, created] = await Class.findOrCreate({
                where: { name: c.name },
                defaults: c
            });
            if (created) {
                console.log(`Created class: ${c.name}`);
            } else {
                console.log(`Class already exists: ${c.name}`);
            }
        }

        console.log('Seeding complete.');
    } catch (error) {
        console.error('Error seeding classes:', error);
    } finally {
        process.exit();
    }
};

seedClasses();
