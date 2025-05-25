import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import ResetPasswordForm from './ResetPasswordForm';

function VerifyCodeForm({ email, setShowForgotPassword }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/verify-code`, { email, code });
      setMessage('Code verified successfully.');
      setShowResetPassword(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
    }
  };

  if (showResetPassword) {
    return <ResetPasswordForm email={email} setShowForgotPassword={setShowForgotPassword} />;
  }

  return (
    <div className="form-container">
      <h2>Enter Code</h2>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-row">
          <label htmlFor="code" className="form-label">4-Digit Code</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            maxLength={4}
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

VerifyCodeForm.propTypes = {
  email: PropTypes.string.isRequired,
  setShowForgotPassword: PropTypes.func.isRequired,
};

export default VerifyCodeForm;