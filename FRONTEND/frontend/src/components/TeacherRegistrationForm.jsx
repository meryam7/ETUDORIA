import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ForgotPasswordForm from '../components/ForgotPasswordForm.jsx';

function TeacherRegistrationForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/register/teacher`, formData);
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div>
      <h2>Teacher Registration</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Password"
          required
        />
        <button type="submit">Register</button>
      </form>
      <ForgotPasswordForm />
    </div>
  );
}

export default TeacherRegistrationForm;