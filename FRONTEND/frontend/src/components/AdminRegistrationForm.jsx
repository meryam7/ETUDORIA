import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import { NotificationContext } from '../contexts/NotificationContext';
import { AuthContext } from '../contexts/AuthContext';
import LoginForm from './LoginForm';

function AdminRegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminRole: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useContext(NotificationContext);
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
      // Check admin registration status
      const statusResponse = await axios.get(`${import.meta.env.VITE_API_URL}/getAdminRegistrationStatus`);
      if (!statusResponse.data.allowAdminRegistration) {
        setError('Admin registration is currently disabled');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register/admin`,
        formData
      );

      // Extract userId and message from response
      const { userId, message } = response.data;

      // Automatically log in after successful registration
      const loginResponse = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
        userType: 'admin',
      });

      const { token } = loginResponse.data;

      // Store token and user data (including userId) in AuthContext
      login(formData.email, 'admin', {
        userId, // Include userId for future use (e.g., API calls, analytics)
        username: formData.username,
        adminRole: formData.adminRole,
      }, token);

      // Store credentials if rememberMe is checked
      if (formData.rememberMe) {
        localStorage.setItem('adminCredentials', JSON.stringify({
          email: formData.email,
          password: formData.password,
        }));
      }

      setSuccess(message || 'Registration successful! Redirecting to dashboard...');
      addNotification(`Confirmation email sent to ${formData.email}.`);

      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        adminRole: '',
        rememberMe: false,
      });

      // Navigate to dashboard
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
      adminRole: '',
      rememberMe: false,
    });
    setError('');
    setSuccess('');
  };

  if (showLogin) {
    return <LoginForm userType="Admin" />;
  }

  return (
    <div className="form-container">
      <h2 className="text-xl font-bold mb-4">Sign Up as Admin</h2>
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
          <label htmlFor="adminRole" className="form-label">Admin Role</label>
          <input
            id="adminRole"
            type="text"
            name="adminRole"
            value={formData.adminRole}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g., System Administrator"
            disabled={loading}
          />
        </div>
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
            Remember Me
          </label>
        </div>
        <div className="form-buttons">
          <button type="submit" className="form-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Send'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="form-button button-deny"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="text-blue-600 hover:underline focus:outline-none"
            disabled={loading}
          >
            Sign in
          </button>
        </p>
      </div>
      {showForgotPassword && (
        <ForgotPasswordForm setShowForgotPassword={setShowForgotPassword} />
      )}
    </div>
  );
}

export default AdminRegistrationForm;