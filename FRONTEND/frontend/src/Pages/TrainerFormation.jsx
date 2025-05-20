import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { NotificationContext } from '../contexts/NotificationContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';

function TrainerFormation() {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    capacity: '',
    departments: [],
    details: '',
  });
  const [nameStatus, setNameStatus] = useState(null);
  const [departments, setDepartments] = useState([]);
  const { addNotification } = useContext(NotificationContext);
  const { isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/getDepartmentOptions`);
        setDepartments(response.data.data.map(dept => dept.name));
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  const checkFormationName = async (name) => {
    if (!name) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/checkFormationName`, {
        params: { name, year: new Date().getFullYear() },
      });
      setNameStatus(response.data.available ? 'available' : 'taken');
    } catch (err) {
      console.error('Error checking formation name:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        departments: checked
          ? [...prev.departments, value]
          : prev.departments.filter(dep => dep !== value),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'name') {
        checkFormationName(value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || user.userType !== 'Trainer') {
      addNotification('Access denied.');
      return;
    }
    if (nameStatus !== 'available') {
      addNotification('Formation name is already taken.');
      return;
    }
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.capacity || !formData.departments.length) {
      addNotification('Please fill all fields.');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/trainer/formation`, {
        ...formData,
        trainerEmail: user.email,
      });
      addNotification('Formation proposal sent to Admin.');
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        capacity: '',
        departments: [],
        details: '',
      });
      setNameStatus(null);
    } catch (err) {
      addNotification('Failed to send formation proposal.');
      console.error(err);
    }
  };

  if (!isAuthenticated || user.userType !== 'Trainer') {
    return (
      <div className="center-content">
        <h1>Access Denied</h1>
        <p>You must be a trainer to access this page.</p>
      </div>
    );
  }

  return (
    <div className="center-content">
      <h1>Propose Formation</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Formation Name:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter formation name"
            />
            {nameStatus === 'available' && <span style={{ color: 'green', marginLeft: '0.5rem' }}>✓</span>}
            {nameStatus === 'taken' && <span style={{ color: 'red', marginLeft: '0.5rem' }}>✗</span>}
          </div>
        </div>
        <div className="form-row">
          <label>Duration:</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Capacity:</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
          />
        </div>
        <div className="form-row">
          <label>Departments:</label>
          {departments.map(dept => (
            <div key={dept}>
              <input
                type="checkbox"
                name="departments"
                value={dept}
                checked={formData.departments.includes(dept)}
                onChange={handleChange}
              />
              <label>{dept}</label>
            </div>
          ))}
        </div>
        <div className="form-row">
          <label>Details:</label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            placeholder="Additional details..."
          />
        </div>
        <div className="form-buttons">
          <button type="submit" className="button">Send</button>
          <button type="button" className="button button-deny" onClick={() => setFormData({ name: '', startDate: '', endDate: '', capacity: '', departments: [], details: '' })}>
            Deny
          </button>
        </div>
      </form>
    </div>
  );
}

export default TrainerFormation;