const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// ➕ POST: Mark attendance
router.post("/", async (req, res) => {
  const { name, email, course } = req.body;

  // Basic field check
  if (!name || !email || !course) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const record = new Attendance({ name, email, course });
    await record.save();
    res.status(201).json({ message: "Attendance recorded", record });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 📋 GET: View attendance
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find().sort({ _id: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
