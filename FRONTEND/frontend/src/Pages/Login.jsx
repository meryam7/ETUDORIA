import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../contexts/NotificationContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';

function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { addNotification } = useContext(NotificationContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      addNotification('Please fill all fields.');
      return;
    }
    const success = login(email, password);
    if (success) {
      addNotification('Login successful!');
      navigate('/dashboard');
    } else {
      addNotification('Login failed. Check email for confirmation or verify credentials.');
    }
  };

  return (
    <div className="center-content">
      <h1>Login</h1>
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
        <button type="submit" className="button">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;