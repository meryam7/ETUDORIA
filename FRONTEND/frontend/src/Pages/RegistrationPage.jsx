import React from 'react';
import { Link } from 'react-router-dom';

function RegistrationPage() {
  const userTypes = [
    { type: 'Student', route: '/signup/student' },
    { type: 'Teacher', route: '/signup/teacher' },
    { type: 'Trainer', route: '/signup/trainer' },
    { type: 'Admin', route: '/signup/admin' },
    { type: 'Guest', route: '/signup/guest' },
  ];

  return (
    <section className="registration-section">
      <h2 className="registration-title">Join US</h2>
      <div className="grid">
        {userTypes.map(user => (
          <Link
            key={user.type}
            to={user.route}
            className="user-container"
          >
            <h3 className="user-container-title">Sign Up as {user.type}</h3>
          </Link>
        ))}
      </div>
      <div className="form-links">
        <p>
          <Link to="/" className="link-button">
            Back to Home
          </Link>
        </p>
      </div>
    </section>
  );
}

export default RegistrationPage;