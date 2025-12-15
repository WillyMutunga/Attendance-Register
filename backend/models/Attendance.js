const mongoose = require("mongoose");

// 📄 Attendance Schema
const AttendanceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // email format validation
  },
  course: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    default: new Date().toLocaleString(),
  },
});

// Export model
module.exports = mongoose.model("Attendance", AttendanceSchema);
