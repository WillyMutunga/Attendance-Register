const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { auth } = require('../middleware/authMiddleware');

// Get My Notifications
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { UserId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark as Read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, UserId: req.user.id }
        });
        if (!notification) return res.status(404).json({ message: 'Not found' });

        notification.read = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
