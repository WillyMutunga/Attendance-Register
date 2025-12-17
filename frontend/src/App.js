import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";
import API_BASE from "./config";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authView, setAuthView] = useState("login");

  // Data
  const [classes, setClasses] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [classSessions, setClassSessions] = useState([]);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Edit State
  const [editingSession, setEditingSession] = useState(null);

  // Nav State
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard, my-classes, available-classes, profile

  // Handlers
  const fetchClasses = async () => {
    try {
      const res = await fetch(API_BASE + "/classes");
      const data = await res.json();
      if (Array.isArray(data)) setClasses(data);
      else setClasses([]);
    } catch (err) { console.error(err); setClasses([]); }
  };

  const fetchMyClasses = async () => {
    try {
      const res = await fetch(API_BASE + "/classes/my-classes", {
        headers: { "x-auth-token": token }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMyClasses(data);
      } else {
        setMyClasses([]);
      }
    } catch (err) { console.error(err); setMyClasses([]); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(API_BASE + "/notifications", {
        headers: { "x-auth-token": token }
      });
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
      else setNotifications([]);
    } catch (err) { console.error(err); setNotifications([]); }
  };

  const markNotificationRead = async (id) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { "x-auth-token": token }
      });
      // Update local state
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (token) {
      if (user.role === 'admin') {
        fetchClasses();
      } else {
        fetchClasses();
        fetchMyClasses();
        fetchNotifications();
      }
    }
  }, [token, user]);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setClasses([]);
    setMyClasses([]);
    setSelectedClass(null);
    setEditingSession(null);
    setNotifications([]);
    setViewMode('dashboard');
  };

  // Actions
  const enrollInClass = async (classId) => {
    try {
      const res = await fetch(API_BASE + "/classes/enroll", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({ classId })
      });
      if (res.ok) {
        alert("Enrolled successfully!");
        fetchMyClasses();
      }
    } catch (err) { alert(err.message); }
  };

  const fetchClassDetails = async (c) => {
    setSelectedClass(c);
    setEditingSession(null);
    try {
      const res = await fetch(`${API_BASE}/classes/${c.id}/sessions`, {
        headers: { "x-auth-token": token }
      });
      const sessions = await res.json();
      if (Array.isArray(sessions)) setClassSessions(sessions);
      else setClassSessions([]);
    } catch (err) { console.error(err); setClassSessions([]); }

    if (user.role === 'admin') {
      try {
        const res = await fetch(`${API_BASE}/classes/${c.id}/students`, {
          headers: { "x-auth-token": token }
        });
        const data = await res.json();
        if (Array.isArray(data)) setClassStudents(data);
        else setClassStudents([]);
      } catch (err) { console.error(err); setClassStudents([]); }
    }
  };

  const createClass = async () => {
    const name = document.getElementById('newClassName').value;
    const schedule = document.getElementById('newClassSchedule').value;
    const link = document.getElementById('newClassLink').value;

    if (!name || !schedule) {
      alert("Name and Schedule are required");
      return;
    }

    try {
      const res = await fetch(API_BASE + "/classes", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({ name, schedule, attendanceLink: link })
      });
      if (res.ok) {
        alert("Class created successfully!");
        fetchClasses();
        document.getElementById('newClassName').value = '';
        document.getElementById('newClassSchedule').value = '';
        document.getElementById('newClassLink').value = '';
      } else {
        alert("Failed to create class");
      }
    } catch (err) { alert(err.message); }
  };

  const scheduleSession = async () => {
    const topic = document.getElementById('sessionTopic').value;
    const startTime = document.getElementById('sessionTime').value;
    const meetingLink = document.getElementById('sessionLink').value;

    if (!topic || !startTime) {
      alert("Topic and Time are required");
      return;
    }

    try {
      const url = editingSession
        ? `${API_BASE}/classes/sessions/${editingSession.id}`
        : `${API_BASE}/classes/${selectedClass.id}/sessions`;

      const method = editingSession ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({ topic, startTime, meetingLink })
      });
      if (res.ok) {
        alert(editingSession ? "Session Updated!" : "Session Scheduled!");
        fetchClassDetails(selectedClass);
        setEditingSession(null);
        if (document.getElementById('sessionTopic')) document.getElementById('sessionTopic').value = '';
        if (document.getElementById('sessionTime')) document.getElementById('sessionTime').value = '';
        if (document.getElementById('sessionLink')) document.getElementById('sessionLink').value = '';
      }
    } catch (err) { alert(err.message); }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      const res = await fetch(`${API_BASE}/classes/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { "x-auth-token": token }
      });
      if (res.ok) {
        fetchClassDetails(selectedClass);
      }
    } catch (err) { alert(err.message); }
  };

  const startEditSession = (s) => {
    setEditingSession(s);
    setTimeout(() => {
      if (document.getElementById('sessionTopic')) document.getElementById('sessionTopic').value = s.topic;
      if (document.getElementById('sessionTime')) {
        const d = new Date(s.startTime);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        document.getElementById('sessionTime').value = d.toISOString().slice(0, 16);
      }
      if (document.getElementById('sessionLink')) document.getElementById('sessionLink').value = s.meetingLink || '';
    }, 100);
  };

  const cancelEdit = () => {
    setEditingSession(null);
    document.getElementById('sessionTopic').value = '';
    document.getElementById('sessionTime').value = '';
    document.getElementById('sessionLink').value = '';
  };

  const submitAttendance = async (e, classData) => {
    e.preventDefault();
    try {
      const res = await fetch(API_BASE + "/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          course: classData.name
        })
      });
      const data = await res.json();
      if (res.ok) alert(data.message);
      else alert(data.message || "Failed");
    } catch (err) { alert("Error: " + err.message); }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    const name = e.target.pName.value;
    const email = e.target.pEmail.value;
    const password = e.target.pPassword.value;

    try {
      const res = await fetch(API_BASE + "/auth/profile", {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({ name, email, password: password || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(prev => ({ ...prev, name: data.name, email: data.email }));
        alert("Profile Updated Successfully!");
        e.target.pPassword.value = ''; // Clear password field
      } else {
        alert(data.message || "Update Failed");
      }
    } catch (err) { alert(err.message); }
  };

  // --- VIEWS ---

  if (!user) {
    return (
      <div className="App">
        <header className="App-header"><h1>Online Attendance System</h1></header>
        <div className="App-container">
          {authView === "login" ?
            <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthView("register")} /> :
            <Register onLogin={handleLogin} onSwitchToLogin={() => setAuthView("login")} />
          }
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="App">
      <header className="App-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 onClick={() => { setSelectedClass(null); setViewMode('dashboard'); }} style={{ cursor: 'pointer' }}>Moringa Attendance</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span>{user.name} ({user.role})</span>
          <button onClick={handleLogout} style={{ width: 'auto', padding: '5px 10px' }}>Logout</button>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="navbar" style={{ position: 'relative' }}>
        <button className="nav-toggle" onClick={() => setIsNavOpen(!isNavOpen)}>
          ☰
        </button>
        <ul className={`nav-links ${isNavOpen ? 'open' : ''}`} style={{ flex: 1 }}>
          <li className="nav-link" onClick={() => { setSelectedClass(null); setViewMode('dashboard'); setIsNavOpen(false); }}>Dashboard</li>
          <li className="nav-link" onClick={() => {
            setSelectedClass(null);
            setViewMode(user.role === 'admin' ? 'dashboard' : 'my-classes');
            setIsNavOpen(false);
          }}>{user.role === 'admin' ? 'Manage Classes' : 'My Classes'}</li>
          {user.role === 'student' && (
            <li className="nav-link" onClick={() => { setSelectedClass(null); setViewMode('available-classes'); setIsNavOpen(false); }}>Available Classes</li>
          )}
          <li className="nav-link" onClick={() => { setSelectedClass(null); setViewMode('profile'); setIsNavOpen(false); }}>Account Details</li>
        </ul>

        {/* Notification Bell */}
        {user.role === 'student' && (
          <div style={{ position: 'relative', cursor: 'pointer', marginRight: '20px' }} onClick={() => setShowNotifications(!showNotifications)}>
            <span style={{ fontSize: '1.2rem', color: 'white' }}>🔔</span>
            {unreadCount > 0 && (
              <span className="badge" style={{ top: '-8px', right: '-8px' }}>{unreadCount}</span>
            )}
            {showNotifications && (
              <div className="notifications-dropdown" style={{ top: '40px', right: '0', color: 'black' }}>
                <h4>Notifications</h4>
                {notifications.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <li key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={n.read ? 'notif-read' : 'notif-unread'}
                      >
                        {n.message}
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p>No notifications.</p>}
              </div>
            )}
          </div>
        )}

      </nav>

      <div className="App-container">

        {/* PROFILE VIEW */}
        {viewMode === 'profile' && !selectedClass && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="attendance-card">
              <h2>Account Details</h2>
              <form onSubmit={updateProfile}>
                <div className="form-group">
                  <label>Name</label>
                  <input name="pName" defaultValue={user.name} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="pEmail" defaultValue={user.email} required />
                </div>
                <div className="form-group">
                  <label>New Password (Optional)</label>
                  <input name="pPassword" type="password" placeholder="Leave blank to keep current" />
                </div>
                <button type="submit" style={{ marginTop: '20px' }}>Update Profile</button>
              </form>
            </div>
          </div>
        )}

        {/* STUDENT VIEW */}
        {user.role === 'student' && viewMode !== 'profile' && (
          <>
            {!selectedClass ? (
              <div style={{ width: '100%', maxWidth: '800px' }}>

                {/* My Classes Section */}
                {(viewMode === 'dashboard' || viewMode === 'my-classes') && (
                  <>
                    <h2>My Enrolled Classes</h2>
                    <div className="class-grid" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      {myClasses.length > 0 ? myClasses.map(c => (
                        <div key={c.id} className="attendance-card" style={{ width: '250px', cursor: 'pointer' }} onClick={() => fetchClassDetails(c)}>
                          <h3>{c.name}</h3>
                          <p>{c.schedule}</p>
                          <button>View Class</button>
                        </div>
                      )) : <p>You are not enrolled in any classes.</p>}
                    </div>
                  </>
                )}

                {/* Available Classes Section */}
                {(viewMode === 'dashboard' || viewMode === 'available-classes') && (
                  <>
                    <h2 style={{ marginTop: '40px' }}>Available Classes</h2>
                    <div className="class-grid" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      {classes.filter(c => !myClasses.find(mc => mc.id === c.id)).map(c => (
                        <div key={c.id} className="attendance-card" style={{ width: '250px' }}>
                          <h3>{c.name}</h3>
                          <p>{c.schedule}</p>
                          <button onClick={() => enrollInClass(c.id)}>Enroll</button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="attendance-card">
                <button onClick={() => setSelectedClass(null)} style={{ marginBottom: '20px', background: '#ccc', color: '#000' }}>Back</button>
                <h2>{selectedClass.name}</h2>
                <p><strong>Schedule:</strong> {selectedClass.schedule}</p>
                {selectedClass.attendanceLink && <p><strong>Class Link:</strong> <a href={selectedClass.attendanceLink} target="_blank" rel="noreferrer">Join Class</a></p>}

                <h3>Upcoming Sessions</h3>
                {classSessions.length > 0 ? (
                  <ul>
                    {classSessions.map(s => (
                      <li key={s.id} style={{ marginBottom: '10px' }}>
                        <strong>{new Date(s.startTime).toLocaleString()}</strong>: {s.topic}
                        {s.meetingLink && (
                          <div style={{ marginTop: '4px' }}>
                            <a href={s.meetingLink} target="_blank" rel="noreferrer" style={{ fontWeight: 'bold', color: '#007bff' }}>Join Meeting</a>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : <p>No sessions scheduled yet.</p>}

                <hr style={{ margin: '20px 0' }} />
                <h3>Mark Attendance</h3>
                <form onSubmit={(e) => submitAttendance(e, selectedClass)}>
                  <div className="form-group">
                    <input type="text" value={user.name} readOnly style={{ background: '#f0f0f0' }} />
                  </div>
                  <div className="form-group">
                    <input type="text" value={selectedClass.name} readOnly style={{ background: '#f0f0f0' }} />
                  </div>
                  <button type="submit">Submit Attendance</button>
                </form>
              </div>
            )}
          </>
        )}

        {/* ADMIN VIEW */}
        {user.role === 'admin' && viewMode !== 'profile' && (
          <>
            {!selectedClass ? (
              <div style={{ width: '100%', maxWidth: '800px' }}>
                <h2>Manage Classes</h2>
                <div className="attendance-card" style={{ marginBottom: '30px', border: '1px dashed #101F3C' }}>
                  <h3>Create New Class</h3>
                  <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
                    <input id="newClassName" placeholder="Class Name (e.g. DevOps)" />
                    <input id="newClassSchedule" placeholder="Schedule (e.g. Mon 10am)" />
                    <input id="newClassLink" placeholder="Class Link (Optional)" style={{ gridColumn: 'span 2' }} />
                    <button onClick={createClass} style={{ gridColumn: 'span 2' }}>Create Class</button>
                  </div>
                </div>

                <div className="class-grid" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  {classes.map(c => (
                    <div key={c.id} className="attendance-card" style={{ width: '250px', cursor: 'pointer' }}
                      onClick={() => fetchClassDetails(c)}>
                      <h3>{c.name}</h3>
                      <p>{c.schedule}</p>
                      <button>Manage</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="attendance-card" style={{ maxWidth: '800px' }}>
                <button onClick={() => setSelectedClass(null)} style={{ marginBottom: '20px', background: '#ccc', color: '#000' }}>Back to Dashboard</button>
                <h2>{selectedClass.name} - Management</h2>

                <h3 style={{ marginTop: '20px' }}>{editingSession ? 'Edit Service' : 'Schedule New Session'}</h3>
                {editingSession && <p style={{ color: 'orange' }}>Editing: {editingSession.topic}</p>}

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input id="sessionTopic" placeholder="Topic (e.g. Intro to Docker)" style={{ flex: 1 }} />
                  <input id="sessionTime" type="datetime-local" style={{ flex: 1 }} />
                  <input id="sessionLink" placeholder="Session Link (e.g. Zoom URL)" style={{ flex: '1 1 100%' }} />
                  <div style={{ flex: '1 1 100%', display: 'flex', gap: '10px' }}>
                    <button onClick={scheduleSession}>{editingSession ? 'Update Session' : 'Schedule'}</button>
                    {editingSession && <button onClick={cancelEdit} style={{ background: '#ccc', color: '#000' }}>Cancel</button>}
                  </div>
                </div>

                <h3>Scheduled Sessions</h3>
                {classSessions.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {classSessions.map(s => (
                      <li key={s.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{new Date(s.startTime).toLocaleString()}</strong> - {s.topic}
                          {s.meetingLink && <div>(<a href={s.meetingLink} target="_blank" rel="noreferrer">Link</a>)</div>}
                        </div>
                        <div>
                          <button onClick={() => startEditSession(s)} style={{ marginRight: '5px', background: '#007bff' }}>Edit</button>
                          <button onClick={() => deleteSession(s.id)} style={{ background: '#dc3545' }}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p>No sessions scheduled.</p>}

                <h3>Enrolled Students ({classStudents.length})</h3>
                <table cellPadding="10" style={{ width: '100%' }}>
                  <thead>
                    <tr><th>Name</th><th>Email</th></tr>
                  </thead>
                  <tbody>
                    {classStudents.map(s => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default App;
