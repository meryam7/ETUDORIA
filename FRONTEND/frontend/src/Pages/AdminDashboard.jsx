import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { NotificationContext } from '../contexts/NotificationContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';

function AdminDashboard() {
  const [stats, setStats] = useState({ daily: { logins: 0, signups: 0 }, weekly: { logins: 0, signups: 0 }, monthly: { logins: 0, signups: 0 } });
  const [view, setView] = useState('daily');
  const [newsContent, setNewsContent] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [formations, setFormations] = useState([]);
  const [adminSignupEnabled, setAdminSignupEnabled] = useState(false);
  const { addNotification } = useContext(NotificationContext);
  const { isAuthenticated, user, setAllowAdminSignup } = useContext(AuthContext);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`);
        setStats(response.data);
      } catch (err) {
        addNotification('Failed to fetch stats.');
        console.error('Error fetching stats:', err);
      }
    };
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/announcements`);
        setAnnouncements(response.data);
      } catch (err) {
        addNotification('Failed to fetch announcements.');
        console.error('Error fetching announcements:', err);
      }
    };
    const fetchFormations = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/formations`);
        setFormations(response.data);
      } catch (err) {
        addNotification('Failed to fetch formations.');
        console.error('Error fetching formations:', err);
      }
    };
    fetchStats();
    fetchAnnouncements();
    fetchFormations();
  }, []);

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    if (!newsContent) {
      addNotification('News content cannot be empty.');
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/news`, { content: newsContent });
      addNotification('News posted successfully.');
      setNewsContent('');
    } catch (err) {
      addNotification('Failed to post news.');
      console.error('Error posting news:', err);
    }
  };

  const handleAnnouncementAction = async (id, action) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/announcement/${id}/${action}`);
      addNotification(`Announcement ${action}ed.`);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err) {
      addNotification(`Failed to ${action} announcement.`);
      console.error(`Error ${action}ing announcement:`, err);
    }
  };

  const handleFormationAction = async (id, action) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/formation/${id}/${action}`);
      addNotification(`Formation ${action}ed.`);
      setFormations(formations.filter(f => f.id !== id));
    } catch (err) {
      addNotification(`Failed to ${action} formation.`);
      console.error(`Error ${action}ing formation:`, err);
    }
  };

  const toggleAdminSignup = () => {
    setAdminSignupEnabled(!adminSignupEnabled);
    setAllowAdminSignup(!adminSignupEnabled);
    addNotification(`Admin signup ${!adminSignupEnabled ? 'enabled' : 'disabled'}.`);
  };

  if (!isAuthenticated || user.userType !== 'Admin') {
    return (
      <div className="center-content">
        <h1>Access Denied</h1>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  return (
    <div className="center-content">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-section">
        <h2>Statistics</h2>
        <div className="stats-controls">
          <button className="button" onClick={() => setView('daily')}>Daily</button>
          <button className="button" onClick={() => setView('weekly')}>Weekly</button>
          <button className="button" onClick={() => setView('monthly')}>Monthly</button>
        </div>
        <div className="stats-display">
          <p>Logins: {stats[view].logins}</p>
          <p>Signups: {stats[view].signups}</p>
        </div>
      </div>
      <div className="dashboard-section">
        <h2>Post News</h2>
        <form onSubmit={handleNewsSubmit}>
          <textarea
            value={newsContent}
            onChange={(e) => setNewsContent(e.target.value)}
            placeholder="Enter news content..."
            className="form-textarea"
          />
          <button type="submit" className="button">Post News</button>
        </form>
      </div>
      <div className="dashboard-section">
        <h2>Teacher Announcements</h2>
        {announcements.length === 0 ? (
          <p>No pending announcements.</p>
        ) : (
          announcements.map(a => (
            <div key={a.id} className="announcement-item">
              <p><strong>Type:</strong> {a.type}</p>
              <p><strong>Content:</strong> {a.message || 'PDF uploaded'}</p>
              <p><strong>From:</strong> {a.teacherEmail}</p>
              <button className="button" onClick={() => handleAnnouncementAction(a.id, 'approve')}>Approve</button>
              <button className="button button-deny" onClick={() => handleAnnouncementAction(a.id, 'reject')}>Reject</button>
            </div>
          ))
        )}
      </div>
      <div className="dashboard-section">
        <h2>Trainer Formations</h2>
        {formations.length === 0 ? (
          <p>No pending formations.</p>
        ) : (
          formations.map(f => (
            <div key={f.id} className="formation-item">
              <p><strong>Name:</strong> {f.name}</p>
              <p><strong>Duration:</strong> {f.startDate} to {f.endDate}</p>
              <p><strong>Capacity:</strong> {f.capacity}</p>
              <p><strong>Departments:</strong> {f.departments.join(', ')}</p>
              <p><strong>Details:</strong> {f.details}</p>
              <p><strong>From:</strong> {f.trainerEmail}</p>
              <button className="button" onClick={() => handleFormationAction(f.id, 'approve')}>Approve</button>
              <button className="button button-deny" onClick={() => handleFormationAction(f.id, 'reject')}>Reject</button>
            </div>
          ))
        )}
      </div>
      <div className="dashboard-section">
        <h2>Settings</h2>
        <label>
          <input
            type="checkbox"
            checked={adminSignupEnabled}
            onChange={toggleAdminSignup}
          />
          Allow Admin Signup
        </label>
      </div>
    </div>
  );
}

export default AdminDashboard;