import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';

function Signup() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const allowAdminSignup = authContext ? authContext.allowAdminSignup : true;

  console.log('Signup.jsx rendered, allowAdminSignup:', allowAdminSignup);

  const handleContainerClick = (path) => {
    console.log(`Navigating to ${path}`);
    navigate(path);
  };

  return (
    <div className="center-content">
      <h1>Choose Your Registration Type</h1>
      <div className="grid">
        <div
          className="user-container"
          onClick={() => handleContainerClick('/register/student')}
        >
          <h3>Sign Up as Student</h3>
          <p>Join as a student to access courses and materials.</p>
        </div>
        <div
          className="user-container"
          onClick={() => handleContainerClick('/register/teacher')}
        >
          <h3>Sign Up as Teacher</h3>
          <p>Register as a teacher to post courses and announcements.</p>
        </div>
        {allowAdminSignup ? (
          <div
            className="user-container"
            onClick={() => handleContainerClick('/register/admin')}
          >
            <h3>Sign Up as Admin</h3>
            <p>Manage the platform as an administrator.</p>
          </div>
        ) : (
          console.log('Admin signup container hidden')
        )}
        <div
          className="user-container"
          onClick={() => handleContainerClick('/register/trainer')}
        >
          <h3>Sign Up as Trainer</h3>
          <p>Propose training formations as a trainer.</p>
        </div>
        <div
          className="user-container"
          onClick={() => handleContainerClick('/register/guest')}
        >
          <h3>Sign Up as Guest</h3>
          <p>Access limited content as a guest for 24 hours.</p>
        </div>
      </div>
    </div>
  );
}

export default Signup;