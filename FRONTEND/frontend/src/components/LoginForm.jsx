import React, { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';

function LoginForm() {
  const { userType } = useParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
        userType: userType.toLowerCase(),
      });

      const { token, userId, username } = response.data;

      login(formData.email, userType.toLowerCase(), { userId, username }, token);
      addNotification('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: '',
      password: '',
    });
    setError('');
    navigate(`/signup/${userType.toLowerCase()}`);
  };

  return (
    <div className="form-container">
      <h2>Sign In as {userType}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="form-input"
            disabled={loading}
          />
        </div>
        <div className="form-links">
          <p>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="link-button"
              disabled={loading}
            >
              Forgot password?
            </button>
          </p>
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
    </div>
  );
}

export default LoginForm;