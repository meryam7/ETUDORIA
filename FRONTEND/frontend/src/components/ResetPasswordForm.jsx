import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

function ResetPasswordForm({ email, setShowForgotPassword }) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/reset-password`, {
        email,
        newPassword: formData.newPassword,
      });
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      newPassword: '',
      confirmNewPassword: '',
    });
    setError('');
    setMessage('');
    setShowForgotPassword(false);
  };

  return (
    <div className="form-container">
      <h2>{email} - Reset Password</h2>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-row">
          <label htmlFor="newPassword" className="form-label">New Password</label>
          <input
            id="newPassword"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            minLength={8}
            className="form-input"
            disabled={loading}
          />
        </div>
        <div className="form-row">
          <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password</label>
          <input
            id="confirmNewPassword"
            type="password"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            required
            minLength={8}
            className="form-input"
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
    </div>
  );
}

ResetPasswordForm.propTypes = {
  email: PropTypes.string.isRequired,
  setShowForgotPassword: PropTypes.func.isRequired,
};

export default ResetPasswordForm;