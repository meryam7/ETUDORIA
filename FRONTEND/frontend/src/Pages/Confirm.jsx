import React, { useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NotificationContext } from '../contexts/NotificationContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';

function Confirm() {
  const { token } = useParams();
  const { confirmEmail } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  useEffect(() => {
    const success = confirmEmail(token);
    if (success) {
      addNotification('Email confirmed! You are now authenticated.');
      navigate('/dashboard');
    } else {
      addNotification('Invalid or expired confirmation link.');
      navigate('/');
    }
  }, [token, confirmEmail, addNotification, navigate]);

  return (
    <div className="center-content">
      <h1>Confirming Email...</h1>
      <p>Please wait while we verify your email.</p>
    </div>
  );
}

export default Confirm;