import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../contexts/NotificationContext';
import { AuthContext } from '../contexts/AuthContext';

function StudentRegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gradeLevel: '',
    gradeYear: '',
    masterType: '',
    departmentName: '',
    rememberMe: false,
  });
  const [gradeOptions, setGradeOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useContext(NotificationContext);
  const { register } = useContext(AuthContext);

  useEffect(() => {
    const fetchGradeOptions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/getGradeOptions`);
        setGradeOptions(response.data.data);
      } catch (err) {
        setError('Failed to fetch grade options');
        console.error('Error fetching grade options:', err);
      }
    };
    fetchGradeOptions();
  }, []);

  useEffect(() => {
    const fetchDepartmentOptions = async () => {
      if (formData.gradeLevel) {
        try {
          const params = { level: formData.gradeLevel };
          if (formData.gradeLevel === 'Master' && formData.masterType) {
            params.masterType = formData.masterType;
          }
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/getDepartmentOptions`,
            { params }
          );
          setDepartmentOptions(response.data.data);
          setFormData(prev => ({ ...prev, departmentName: '' }));
        } catch (err) {
          setError('Failed to fetch department options');
          console.error('Error fetching department options:', err);
        }
      }
    };
    fetchDepartmentOptions();
  }, [formData.gradeLevel, formData.masterType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'gradeLevel' ? { 
        gradeYear: '', 
        masterType: '', 
        departmentName: '' 
      } : {}),
      ...(name === 'gradeYear' ? { departmentName: '' } : {}),
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/register/student`,
        formData
      );
      await register(formData.email, formData.password, 'Student', formData);
      setSuccess('Registration successful! Check your email for confirmation.');
      addNotification(`Confirmation email sent to ${formData.email}.`);
      
      if (formData.rememberMe) {
        localStorage.setItem('studentCredentials', JSON.stringify({
          email: formData.email,
          password: formData.password,
        }));
      }
      
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        gradeLevel: '',
        gradeYear: '',
        masterType: '',
        departmentName: '',
        rememberMe: false,
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      gradeLevel: '',
      gradeYear: '',
      masterType: '',
      departmentName: '',
      rememberMe: false,
    });
    setError('');
    setSuccess('');
    navigate('/signup');
  };

  return (
    <div className="form-container">
      <h2>Sign Up as Student</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-row">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="form-input"
            disabled={loading}
          />
        </div>
        <div className="form-row">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
            disabled={loading}
          />
        </div>
        <div className="form-row">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="form-input"
            disabled={loading}
          />
        </div>
        <div className="form-row">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
            className="form-input"
            disabled={loading}
          />
        </div>
        <div className="form-row">
          <label htmlFor="gradeLevel" className="form-label">Grade Level</label>
          <select
            id="gradeLevel"
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleChange}
            required
            className="form-input"
            disabled={loading}
          >
            <option value="">Select Grade Level</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
          </select>
        </div>
        {formData.gradeLevel && (
          <div className="form-row">
            <label htmlFor="gradeYear" className="form-label">Year</label>
            <select
              id="gradeYear"
              name="gradeYear"
              value={formData.gradeYear}
              onChange={handleChange}
              required
              className="form-input"
              disabled={loading}
            >
              <option value="">Select Year</option>
              {gradeOptions
                .filter(option => option.level === formData.gradeLevel)
                .map(option => (
                  <option key={option.year} value={option.year}>
                    {option.year}
                  </option>
                ))}
            </select>
          </div>
        )}
        {formData.gradeLevel === 'Master' && (
          <div className="form-row">
            <label htmlFor="masterType" className="form-label">Master Type</label>
            <select
              id="masterType"
              name="masterType"
              value={formData.masterType}
              onChange={handleChange}
              required
              className="form-input"
              disabled={loading}
            >
              <option value="">Select Master Type</option>
              <option value="Research">Research</option>
              <option value="Professional">Professional</option>
            </select>
          </div>
        )}
        {formData.gradeLevel && formData.gradeYear && (
          <div className="form-row">
            <label htmlFor="departmentName" className="form-label">Department</label>
            <select
              id="departmentName"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleChange}
              required
              className="form-input"
              disabled={loading}
            >
              <option value="">Select Department</option>
              {departmentOptions.map(dept => (
                <option key={dept.name} value={dept.name}>
                  {dept.displayText || dept.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="form-input-checkbox"
            disabled={loading}
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
            Remember Me
          </label>
        </div>
        <div className="form-buttons">
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Submitting...' : 'Send'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="button button-deny"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
      <div className="form-links">
        <p>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login/student')}
            className="link-button"
            disabled={loading}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default StudentRegistrationForm;