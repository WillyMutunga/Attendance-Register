const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

const { auth, isAdmin } = require('../middleware/authMiddleware');

const { Op } = require('sequelize');

// ➕ POST: Mark attendance (Protected: All users)
router.post("/", auth, async (req, res) => {
  const { name, email, course } = req.body;
  const { Class, ClassSession } = require('../models'); // Lazy load models

  // Basic field check
  if (!name || !email || !course) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    // 1. Find the Class ID based on the course name
    const classObj = await Class.findOne({ where: { name: course } });
    if (!classObj) {
      return res.status(404).json({ message: "Class not found." });
    }

    // 2. Check for an ACTIVE Session
    // Logic: Session Start Time must be in the past 2 hours (assuming 2h class duration)
    // AND Session Start Time must not be in the future (more than 15 mins lead time)
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
    const fifteenMinutesFromNow = new Date(now.getTime() + (15 * 60 * 1000));

    const activeSession = await ClassSession.findOne({
      where: {
        ClassId: classObj.id,
        startTime: {
          [Op.between]: [twoHoursAgo, fifteenMinutesFromNow]
        }
      }
    });

    if (!activeSession) {
      return res.status(400).json({ message: "No active session found. You can only mark attendance during class time." });
    }

    // 3. Check duplicate (Existing Logic)
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
