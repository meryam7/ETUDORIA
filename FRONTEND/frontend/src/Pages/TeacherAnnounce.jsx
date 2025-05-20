import React, { useState, useContext } from 'react';
import axios from 'axios';
import { NotificationContext } from '../contexts/NotificationContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';

function TeacherAnnounce() {
  const [announcementType, setAnnouncementType] = useState('message');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const { addNotification } = useContext(NotificationContext);
  const { isAuthenticated, user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || user.userType !== 'Teacher') {
      addNotification('Access denied.');
      return;
    }
    if (!message && !file) {
      addNotification('Please provide a message or file.');
      return;
    }

    const formData = new FormData();
    formData.append('type', announcementType);
    formData.append('message', message);
    if (file) {
      formData.append('file', file);
    }
    formData.append('teacherEmail', user.email);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/teacher/announce`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      addNotification('Announcement sent to Admin.');
      setMessage('');
      setFile(null);
    } catch (err) {
      addNotification('Failed to send announcement.');
      console.error(err);
    }
  };

  if (!isAuthenticated || user.userType !== 'Teacher') {
    return (
      <div className="center-content">
        <h1>Access Denied</h1>
        <p>You must be a teacher to access this page.</p>
      </div>
    );
  }

  return (
    <div className="center-content">
      <h1>Announce Test Date</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Type:</label>
          <select
            value={announcementType}
            onChange={(e) => setAnnouncementType(e.target.value)}
          >
            <option value="message">Message</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        {announcementType === 'message' && (
          <div className="form-row">
            <label>Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter test date announcement..."
            />
          </div>
        )}
        {announcementType === 'pdf' && (
          <div className="form-row">
            <label>Upload PDF:</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
        )}
        <div className="form-buttons">
          <button type="submit" className="button">Send</button>
          <button type="button" className="button button-deny" onClick={() => setMessage('')}>Deny</button>
        </div>
      </form>
    </div>
  );
}

export default TeacherAnnounce;