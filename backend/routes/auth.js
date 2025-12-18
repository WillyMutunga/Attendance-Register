const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth } = require('../middleware/authMiddleware');

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ where: { email } });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = await User.create({ name, email, password, role });

        const payload = { user: { id: user.id, role: user.role } };
        const jwtSecret = process.env.JWT_SECRET || 'secret';
        jwt.sign(payload, jwtSecret, { expiresIn: '5d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const payload = { user: { id: user.id, role: user.role } };
        const jwtSecret = process.env.JWT_SECRET || 'secret';
        jwt.sign(payload, jwtSecret, { expiresIn: '5d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Current User (Profile)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        // Return updated user without password
        const updatedUser = { id: user.id, name: user.name, email: user.email, role: user.role };
        res.json(updatedUser);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Create a temporary secret based on user's current password hash (invalidates after password change)
        const secret = (process.env.JWT_SECRET || 'secret') + user.password;
        const payload = { id: user.id, email: user.email };
        const token = jwt.sign(payload, secret, { expiresIn: '15m' });

        // IMPORTANT: In production, use the real domain. For now, we assume the user knows the URL structure.
        // We will send the frontend URL structure.
        // Render Frontend URL: https://attendance-register-vv99.onrender.com/reset-password/${user.id}/${token}

        const link = `https://attendance-register-vv99.onrender.com/reset-password/${user.id}/${token}`;

        // We need to import sendEmail dynamically or move the require up. 
        // For now I'm requiring it here to avoid messing with top imports too much in this specific edit.
        const { sendEmail } = require('../utils/emailService');

        await sendEmail(email, "Password Reset Request", `Click this link to reset your password: ${link}`);

        res.json({ message: "Password reset link sent to email." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reset Password
router.post('/reset-password/:id/:token', async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const secret = (process.env.JWT_SECRET || 'secret') + user.password;
        try {
            jwt.verify(token, secret);
        } catch (err) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ message: "Password reset successful! You can now login." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
