import React from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    console.log('Sign Up button clicked, navigating to /signup');
    navigate('/signup');
  };

  return (
    <div className="center-content">
      <h1>Welcome to Etudoria</h1>
      <p className="welcome-subtitle">
          Discover a world of learning with our comprehensive courses, expert instructors, and vibrant community. Start your journey today!
        </p>
      <div className="signup-button-container">
        <button className="button" onClick={handleSignUpClick}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default Welcome;