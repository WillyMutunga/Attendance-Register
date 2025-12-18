# 📚 Moringa Attendance Register

A full-stack web application for managing class attendance, scheduling sessions, and tracking student participation. Built with **React** (Frontend) and **Node.js/Express** (Backend).

## 🚀 Features

### 🎓 Student Portal
*   **Dashobard:** View enrolled classes and available classes.
*   **Enrollment:** Self-enroll in available courses.
*   **Mark Attendance:** Students can mark their own attendance, but **only during active class session times** (2-hour window).
*   **Notifications:** Receive email and in-app notifications for class invites.
*   **Profile Management:** Update name, email, and password.
*   **Password Recovery:** Reset forgotten passwords via email link.

### 🛡️ Admin Portal
*   **Class Management:** Create new classes and set schedules.
*   **Session Scheduling:** specific Create sessions (topics, times, meeting links) for each class.
*   **Attendance Tracking:** View a detailed log of **who** marked attendance and **when**.
*   **Student List:** View all students enrolled in a specific class.
*   **Google Calendar Integration:** Automatically send calendar invites to students when a session is created.

---

## 🛠️ Technology Stack

*   **Frontend:** React.js, CSS3 (Custom Styles)
*   **Backend:** Node.js, Express.js
*   **Database:** PostgreSQL (Production) / MySQL (Local Development) via Sequelize ORM
*   **Authentication:** JWT (JSON Web Tokens)
*   **Email Service:** Nodemailer (Gmail SMTP)

---

## ⚙️ Local Setup Instructions

### Prerequisites
*   Node.js installed
*   MySQL installed (for local DB)

### 1. Clone the Repository
```bash
git clone https://github.com/WillyMutunga/Attendance-Register.git
cd Attendance-Register
```

### 2. Backend Setup
```bash
cd backend
npm install
```

**Create a `.env` file in the `backend` folder:**
```env
PORT=5000
# Database (Local MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=attendance_db
# OR Connection String (Render PostgreSQL)
DATABASE_URL=

# Security
JWT_SECRET=your_super_secret_key_here

# Email Service (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Canvas API (Optional)
CANVAS_API_KEY=
```

**Run the Backend:**
```bash
node server.js
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

**Create a `src/config.js` file (Optional, if not present):**
```javascript
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
export default API_BASE;
```

**Run the Frontend:**
```bash
npm start
```
Access the app at `http://localhost:3000`.

---

## ☁️ Deployment (Render)

### Backend (Web Service)
1.  Connect GitHub repo to Render.
2.  **Build Command:** `cd backend && npm install`
3.  **Start Command:** `cd backend && node server.js`
4.  **Environment Variables:** Set `DATABASE_URL` (Internal Connection String from Render Postgres), `JWT_SECRET`, and `SMTP_*` variables.

### Frontend (Static Site)
1.  Connect GitHub repo to Render.
2.  **Build Command:** `cd frontend && npm install && npm run build`
3.  **Publish Directory:** `frontend/build`
4.  **Environment Variables:** `REACT_APP_API_URL` = `https://your-backend-url.onrender.com`
5.  **Rewrite Rules:** Add a rule Source `/*` -> Destination `/index.html` to support client-side routing.

---

## 🔌 API Endpoints

### Auth
*   `POST /auth/register` - Create account
*   `POST /auth/login` - Login & Get Token
*   `POST /auth/forgot-password` - Request reset link
*   `POST /auth/reset-password/:id/:token` - Set new password

### Classes
*   `GET /classes` - List all classes
*   `POST /classes` - Create class (Admin)
*   `POST /classes/enroll` - Enroll student
*   `GET /classes/:id/sessions` - Get class sessions

### Attendance
*   `POST /attendance` - Mark attendance (Restricted to active session time)
*   `GET /attendance?course=Name` - Get logs (Admin)