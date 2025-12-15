const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();

const AttendanceRoutes = require("./routes/Attendance");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection (Mongoose >=7 automatically handles parsing)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Routes
app.use("/attendance", AttendanceRoutes);

// Root test route
app.get("/", (req, res) => res.send("Attendance API is running ✅"));

// PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
