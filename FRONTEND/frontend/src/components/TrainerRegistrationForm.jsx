import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { NotificationContext } from '../contexts/NotificationContext';
import { AuthContext } from '../contexts/AuthContext';

function TrainerRegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    trainingArea: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useContext(NotificationContext);
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register/trainer`,
        formData
      );

      const { userId, message } = response.data;

      const loginResponse = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
        userType: 'trainer',
      });

      const { token } = loginResponse.data;

      login(formData.email, 'trainer', {
        userId,
        username: formData.username,
        trainingArea: formData.trainingArea,
      }, token);

      setSuccess(message || 'Registration successful! Redirecting to dashboard...');
      addNotification(`Confirmation email sent to ${formData.email}.`);

      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        trainingArea: '',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      trainingArea: '',
    });
    setError('');
    setSuccess('');
    navigate('/signup');
  };

  return (
    <div className="form-container">
      <h2>Sign Up as Trainer</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-row">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="form-input"
            disabled={loading}
          />
        </div>
        <div className="form-row">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
            disabled={loading}
          />
        </div>
        <div className="form-row">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="form-input"
            disabled={loading}
          />
        </div>
        <div className="form-row">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
            className="form-input"
            disabled={loading}
          />
        </div>
        <div className="form-row">
          <label htmlFor="trainingArea" className="form-label">Training Area</label>
          <input
            id="trainingArea"
            type="text"
            name="trainingArea"
            value={formData.trainingArea}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g., Professional Development"
            disabled={loading}
          />
        </div>
        <div className="form-buttons">
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Submitting...' : 'Send'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="button button-deny"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
      <div className="form-links">
        <p>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login/trainer')}
            className="link-button"
            disabled={loading}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default TrainerRegistrationForm;