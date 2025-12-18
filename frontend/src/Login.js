import React, { useState } from 'react';

import API_BASE from './config';

function Login({ onLogin, onSwitchToRegister, onForgotPassword }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log("Attempting to login to:", API_BASE);
      const res = await fetch(API_BASE + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="attendance-card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
        <p style={{ marginTop: '10px' }}>
          <span style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }} onClick={onForgotPassword}>
            Forgot Password?
          </span>
        </p>
      </form>
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <p>
          Don't have an account?{' '}
          <span
            onClick={onSwitchToRegister}
            style={{ color: '#101F3C', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Register Student
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
