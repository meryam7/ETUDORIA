import React, { useState } from 'react';
import { FaGoogle, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = '/dashboard'; // Adjust redirect as needed
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>Login to Etudoria</h2>
      {error && (
        <div className="alert error">
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="alert success">
          <p>{success}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/forgot-password" className="text-link">
          Forgot Password?
        </Link>
      </div>
      <div style={{ position: 'relative', marginTop: '1.5rem' }}>
        <div style={{ borderTop: '1px solid #D1D5DB', width: '100%' }}></div>
        <div style={{ position: 'absolute', top: '-0.75rem', width: '100%', textAlign: 'center' }}>
          <span style={{ backgroundColor: '#FFFFFF', padding: '0 0.5rem', color: '#6B7280', fontSize: '0.875rem' }}>
            Or continue with
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        <button className="button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaGoogle size={16} style={{ color: '#DC2626' }} />
          Google
        </button>
        <button className="button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaLinkedin size={16} style={{ color: '#2563EB' }} />
          LinkedIn
        </button>
      </div>
    </div>
  );
}

export default LoginForm;