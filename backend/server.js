const express = require("express");
const cors = require("cors");
const { sequelize } = require('./models'); // Import from models index
require('dotenv').config();

const AttendanceRoutes = require("./routes/Attendance");
const AuthRoutes = require("./routes/auth");
const ClassRoutes = require("./routes/classes");
const NotificationRoutes = require("./routes/notifications");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/attendance", AttendanceRoutes);
app.use("/auth", AuthRoutes);
app.use("/classes", ClassRoutes);
app.use("/notifications", NotificationRoutes);


// Root test route
app.get("/", (req, res) => res.send("Attendance API is running ✅"));

// Temporary Seed Route (Visit this ONCE to create admin)
app.get("/seed-admin", async (req, res) => {
  try {
    const { User } = require('./models');
    const bcrypt = require('bcryptjs');

    // Check if admin exists
    const exists = await User.findOne({ where: { email: 'admin@moringaschool.com' } });
    if (exists) return res.send("Admin already exists!");

    // Create Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'System Admin',
      email: 'admin@moringaschool.com',
      password: hashedPassword,
      role: 'admin'
    });

    res.send("Admin Account Created! Email: admin@moringaschool.com | Pass: admin123");
  } catch (err) {
    res.status(500).send("Error seeding admin: " + err.message);
  }
});

// PORT
const PORT = process.env.PORT || 5000;

// Sync Database and Start Server
sequelize.sync({ alter: true }) // Update schema
  .then(() => {
    console.log("MySQL Database Connected & Synced");
    app.listen(PORT, () =>
      console.log(`Backend running on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error("Database Connection Failed:", err);
  });
