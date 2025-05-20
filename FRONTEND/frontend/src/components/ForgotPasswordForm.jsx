import React, { useState } from 'react';
import PropTypes from 'prop-types';

function ForgotPasswordForm({ setShowForgotPassword }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Password reset link sent to your email.');
    setEmail('');
  };

  return (
    <div className="form-container">
      <h2>Forgot Password</h2>
      {message && <p className="success-message">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-field">
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
        <div className="flex gap-2">
          <button type="submit" className="form-button">Send Reset Link</button>
          <button
            type="button"
            onClick={() => setShowForgotPassword(false)}
            className="form-button"
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