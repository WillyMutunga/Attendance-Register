const express = require('express');
const router = express.Router();
const { Class, User, ClassSession, Notification, sequelize } = require('../models');
const { auth, isAdmin } = require('../middleware/authMiddleware');
const { sendCalendarInvite } = require('../utils/emailService');

// Get all classes (for selection/admin)
router.get('/', async (req, res) => {
    try {
        const classes = await Class.findAll();
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get My Enrolled Classes
router.get('/my-classes', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: Class
        });
        res.json(user.Classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get Students in a Class
router.get('/:id/students', auth, isAdmin, async (req, res) => {
    try {
        const clazz = await Class.findByPk(req.params.id, {
            include: User
        });
        if (!clazz) return res.status(404).json({ message: 'Class not found' });
        res.json(clazz.Users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Enroll in a class
router.post('/enroll', auth, async (req, res) => {
    const { classId } = req.body;
    try {
        const user = await User.findByPk(req.user.id);
        const clazz = await Class.findByPk(classId);
        if (!clazz) return res.status(404).json({ message: 'Class not found' });

        await user.addClass(clazz);
        res.json({ message: 'Enrolled successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new class (Admin)
router.post('/', auth, isAdmin, async (req, res) => {
    const { name, schedule, attendanceLink } = req.body;
    if (!name || !schedule) {
        return res.status(400).json({ message: 'Name and Schedule are required' });
    }
    try {
        const newClass = await Class.create({ name, schedule, attendanceLink });
        res.status(201).json(newClass);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a class (Admin)
router.put('/:id', auth, isAdmin, async (req, res) => {
    const { name, schedule, attendanceLink } = req.body;
    try {
        const clazz = await Class.findByPk(req.params.id);
        if (!clazz) return res.status(404).json({ message: 'Class not found' });

        if (name) clazz.name = name;
        if (schedule) clazz.schedule = schedule;
        if (attendanceLink !== undefined) clazz.attendanceLink = attendanceLink;

        await clazz.save();
        res.json(clazz);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Schedule a Session (Admin)
router.post('/:id/sessions', auth, isAdmin, async (req, res) => {
    const { topic, startTime, meetingLink } = req.body;
    try {
        const clazz = await Class.findByPk(req.params.id, {
            include: User // Get enrolled students to notify
        });
        if (!clazz) return res.status(404).json({ message: 'Class not found' });

        const session = await clazz.createSession({
            topic,
            startTime,
            meetingLink
        });

        // Create Notification for each student
        const notifications = clazz.Users.map(user => ({
            UserId: user.id,
            message: `New Session Scheduled: ${topic} for ${clazz.name} at ${new Date(startTime).toLocaleString()}`,
            type: 'session_scheduled'
        }));

        if (notifications.length > 0) {
            await Notification.bulkCreate(notifications);

            // Send Calendar Invites (Await for debugging to see logs)
            const sessionData = {
                topic,
                startTime,
                meetingLink,
                className: clazz.name
            };
            console.log("Triggering email invite...");
            await sendCalendarInvite(clazz.Users, sessionData);
        }

        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a Session (Admin)
router.put('/sessions/:id', auth, isAdmin, async (req, res) => {
    const { topic, startTime, meetingLink } = req.body;
    try {
        const session = await ClassSession.findByPk(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        if (topic) session.topic = topic;
        if (startTime) session.startTime = startTime;
        if (meetingLink !== undefined) session.meetingLink = meetingLink;

        await session.save();
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a Session (Admin)
router.delete('/sessions/:id', auth, isAdmin, async (req, res) => {
    try {
        const session = await ClassSession.findByPk(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        await session.destroy();
        res.json({ message: 'Session deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Sessions for a Class (Public/Auth)
router.get('/:id/sessions', auth, async (req, res) => {
    try {
        const clazz = await Class.findByPk(req.params.id, {
            include: {
                model: ClassSession,
                as: 'Sessions'
            }
        });
        if (!clazz) return res.status(404).json({ message: 'Class not found' });

        // Sort
        if (clazz.Sessions) {
            clazz.Sessions.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        }

        res.json(clazz.Sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
