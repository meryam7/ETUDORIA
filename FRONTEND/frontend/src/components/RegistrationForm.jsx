import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import ForgotPasswordForm from './component/ForgotPasswordForm';

function RegistrationForm({ setShowLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGradeOptions = async () => {
      try {
        const _response = await axios.get(`${import.meta.env.VITE_API_URL}/getGradeOptions`);
        setGradeOptions(_response.data.data);
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
          const _response = await axios.get(
            `${import.meta.env.VITE_API_URL}/getDepartmentOptions`,
            { params }
          );
          setDepartmentOptions(_response.data.data);
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
    setIsSubmitting(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/register/student`,
        formData
      );
      setSuccess('Registration successful!');
      
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
        gradeLevel: '',
        gradeYear: '',
        masterType: '',
        departmentName: '',
        rememberMe: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Student Registration</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Grade Level Field */}
        <div>
          <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700">
            Grade Level
          </label>
          <select
            id="gradeLevel"
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Grade Level</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
          </select>
        </div>

        {/* Year Field (conditional) */}
        {formData.gradeLevel && (
          <div>
            <label htmlFor="gradeYear" className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <select
              id="gradeYear"
              name="gradeYear"
              value={formData.gradeYear}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Master Type Field (conditional) */}
        {formData.gradeLevel === 'Master' && (
          <div>
            <label htmlFor="masterType" className="block text-sm font-medium text-gray-700">
              Master Type
            </label>
            <select
              id="masterType"
              name="masterType"
              value={formData.masterType}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Master Type</option>
              <option value="Research">Research</option>
              <option value="Professional">Professional</option>
            </select>
          </div>
        )}

        {/* Department Field (conditional) */}
        {formData.gradeLevel && formData.gradeYear && (
          <div>
            <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              id="departmentName"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
            Remember Me
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Register'}
        </button>
      </form>

      <div className="mt-4 text-center space-y-2">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Login
          </button>
        </p>
        <p className="text-sm text-gray-600">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Forgot Password?
          </button>
        </p>
      </div>

      {showForgotPassword && (
        <ForgotPasswordForm setShowForgotPassword={setShowForgotPassword} />
      )}
    </div>
  );
}

RegistrationForm.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
};

export default RegistrationForm;