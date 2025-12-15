import React, { useState } from "react";

function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    course: ""
  });

  const [records, setRecords] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit attendance
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.course) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      alert(data.message);
      setForm({ name: "", email: "", course: "" });
    } catch (error) {
      alert("Error submitting attendance");
      console.error(error);
    }
  };

  // Fetch attendance records (admin view)
  const fetchRecords = async () => {
    try {
      const res = await fetch("http://localhost:5000/attendance");
      const data = await res.json();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Moringa Online Class Attendance</h1>
      <p>Mark your attendance below:</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        /><br /><br />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
        /><br /><br />

        <select
          name="course"
          value={form.course}
          onChange={handleChange}
        >
          <option value="">Select Course</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Data Science">Data Science</option>
          <option value="UI/UX">UI/UX</option>
        </select><br /><br />

        <button type="submit">Submit Attendance</button>
      </form>

      <hr />

      <h2>Admin View: Attendance Records</h2>
      <button onClick={fetchRecords} style={{ marginBottom: "20px" }}>
        Load Attendance
      </button>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Course</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={index}>
              <td>{record.name}</td>
              <td>{record.email}</td>
              <td>{record.course}</td>
              <td>{record.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
