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

// Debug Users Route
app.get("/debug-users", async (req, res) => {
  try {
    const { User } = require('./models');
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    res.json(users);
  } catch (err) {
    res.status(500).send("Error fetching users: " + err.message);
  }
});

// Magic Route to Make User an Admin
app.get("/make-admin/:email", async (req, res) => {
  try {
    const { User } = require('./models');
    const user = await User.findOne({ where: { email: req.params.email } });

    if (!user) return res.send("User not found!");

    user.role = 'admin';
    await user.save();

    res.send(`User ${user.email} is now an ADMIN! Please log out and log back in.`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PORT
const PORT = process.env.PORT || 5000;

// Sync Database and Start Server
sequelize.sync({ alter: true }) // Update schema
  .then(() => {
    console.log("-----------------------------------------");
    console.log("ENV CHECK:");
    console.log("DATABASE_URL exists?", !!process.env.DATABASE_URL);
    console.log("Keys available:", Object.keys(process.env).join(", "));
    console.log("-----------------------------------------");

    console.log("Database Connected & Synced"); // Removed "MySQL" hardcoded text
    app.listen(PORT, () =>
      console.log(`Backend running on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error("Database Connection Failed:", err);
  });
