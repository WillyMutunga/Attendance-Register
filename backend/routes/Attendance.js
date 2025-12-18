const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

const { auth, isAdmin } = require('../middleware/authMiddleware');

const { Op } = require('sequelize');

// ➕ POST: Mark attendance (Protected: All users)
router.post("/", auth, async (req, res) => {
  const { name, email, course } = req.body;

  // Basic field check
  if (!name || !email || !course) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    // Check if attendance already marked TODAY
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      where: {
        email: email,
        course: course,
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    if (existing) {
      return res.status(400).json({ message: "You have already marked attendance for this class today." });
    }

    const record = await Attendance.create({ name, email, course });
    res.status(201).json({ message: "Attendance recorded", record });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 📋 GET: View attendance (Protected: Admin only)
router.get("/", auth, isAdmin, async (req, res) => {
  try {
    const { course } = req.query;
    const whereClause = course ? { course } : {};

    const records = await Attendance.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
