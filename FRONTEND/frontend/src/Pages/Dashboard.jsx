import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NotificationContext } from '../contexts/NotificationContext.jsx';

function Dashboard() {
  const [stats, setStats] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [newsForm, setNewsForm] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allowAdminRegistration, setAllowAdminRegistration] = useState(true);
  const { addNotification } = React.useContext(NotificationContext);
  const userId = 'current-user-id'; // Replace with actual admin ID

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/getDashboardStats`
        );
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard stats');
        console.error('Error fetching stats:', err);
      }
    };
    const fetchAdminRegistrationStatus = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/getAdminRegistrationStatus`
        );
        setAllowAdminRegistration(response.data.allowAdminRegistration);
      } catch (err) {
        console.error('Error fetching admin registration status:', err);
      }
    };
    fetchStats();
    fetchAdminRegistrationStatus();
  }, []);

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/postNews`, {
        ...newsForm,
        adminId: userId,
      });
      setSuccess('News posted successfully!');
      addNotification('News posted.');
      setNewsForm({ title: '', content: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post news');
      console.error('Error posting news:', err);
    }
  };

  const handleAdminRegistrationToggle = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/setAdminRegistrationStatus`, {
        allow: !allowAdminRegistration,
      });
      setAllowAdminRegistration(!allowAdminRegistration);
      setSuccess(
        `Admin registration ${!allowAdminRegistration ? 'enabled' : 'disabled'}.`
      );
    } catch (err) {
      setError('Failed to update admin registration status');
      console.error('Error updating admin registration status:', err);
    }
  };

  return (
    <div className="center-content">
      <h1>Admin Dashboard</h1>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <div className="form-container" style={{ marginBottom: '2rem' }}>
        <h2>Login/Signup Statistics</h2>
        <p><strong>Daily:</strong> {stats.daily} users</p>
        <p><strong>Weekly:</strong> {stats.weekly} users</p>
        <p><strong>Monthly:</strong> {stats.monthly} users</p>
      </div>
      <div className="form-container" style={{ marginBottom: '2rem' }}>
        <h2>Post News</h2>
        <form onSubmit={handleNewsSubmit} className="space-y-4">
          <div className="form-field">
            <label htmlFor="news-title" className="form-label">
              Title
            </label>
            <input
              id="news-title"
              type="text"
              value={newsForm.title}
              onChange={(e) =>
                setNewsForm({ ...newsForm, title: e.target.value })
              }
              required
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label htmlFor="news-content" className="form-label">
              Content
            </label>
            <textarea
              id="news-content"
              value={newsForm.content}
              onChange={(e) =>
                setNewsForm({ ...newsForm, content: e.target.value })
              }
              required
              className="form-textarea"
              rows="4"
            ></textarea>
          </div>
          <button type="submit" className="form-button">
            Post News
          </button>
        </form>
      </div>
      <div className="form-container">
        <h2>Settings</h2>
        <div className="form-field">
          <label className="form-label">
            Allow Admin Registration
            <input
              type="checkbox"
              checked={allowAdminRegistration}
              onChange={handleAdminRegistrationToggle}
              className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;