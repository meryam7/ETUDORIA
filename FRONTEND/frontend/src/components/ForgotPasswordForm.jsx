import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import VerifyCodeForm from './VerifyCodeForm';

function ForgotPasswordForm({ setShowForgotPassword }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showVerifyCode, setShowVerifyCode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/forgot-password`, { email });
      setMessage('A 4-digit code has been sent to your email.');
      setShowVerifyCode(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    }
  };

  if (showVerifyCode) {
    return <VerifyCodeForm email={email} setShowForgotPassword={setShowForgotPassword} />;
  }

  return (
    <div className="form-container">
      <h2>Forgot Password</h2>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-row">
          <label htmlFor="forgot-email" className="form-label">Email</label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-buttons">
          <button type="submit" className="button">Send</button>
          <button
            type="button"
            onClick={() => setShowForgotPassword(false)}
            className="button button-deny"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

ForgotPasswordForm.propTypes = {
  setShowForgotPassword: PropTypes.func.isRequired,
};

export default ForgotPasswordForm;