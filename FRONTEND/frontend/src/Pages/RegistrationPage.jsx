import React, { useState, useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';

function RegistrationPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('Student');
  const { addNotification } = useContext(NotificationContext);
  const { register } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      addNotification('Please fill all fields.');
      return;
    }
    const token = register(email, password, userType);
    addNotification(`Confirmation email sent to ${email}. Check your inbox.`);
    // For demo: Log the confirmation link
    console.log(`Navigate to: /confirm/${token}`);
  };

  return (
    <div className="center-content">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-row">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="form-row">
          <label>User Type:</label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="button">
          Submit
        </button>
      </form>
    </div>
  );
}

export default RegistrationPage;