import React, { useState } from 'react';

import API_BASE from './config';

function Register({ onLogin, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student' // Default role
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch(API_BASE + '/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Auto-login after registration
            onLogin(data.user, data.token);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="attendance-card" style={{ maxWidth: '400px', margin: '40px auto' }}>
            <h2>Student Registration</h2>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        autoFocus
                    />
                </div>
                <div className="form-group">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
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
                <button type="submit">Create Account</button>
            </form>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <p>
                    Already have an account?{' '}
                    <span
                        onClick={onSwitchToLogin}
                        style={{ color: '#101F3C', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Register;
