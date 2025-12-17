const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

const { auth, isAdmin } = require('../middleware/authMiddleware');

// ➕ POST: Mark attendance (Protected: All users)
router.post("/", auth, async (req, res) => {
  const { name, email, course } = req.body;

  // Basic field check
  if (!name || !email || !course) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const record = await Attendance.create({ name, email, course });
    res.status(201).json({ message: "Attendance recorded", record });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 📋 GET: View attendance (Protected: Admin only)
router.get("/", auth, isAdmin, async (req, res) => {
  try {
    const records = await Attendance.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
