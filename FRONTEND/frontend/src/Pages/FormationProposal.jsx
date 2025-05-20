import React, { useState, useContext } from 'react';
import axios from 'axios';
import { NotificationContext } from '../contexts/NotificationContext.jsx';

function FormationProposal() {
  const [formData, setFormData] = useState({
    name: '',
    durationStart: '',
    durationEnd: '',
    capacity: '',
    departments: [],
    details: '',
  });
  const [nameStatus, setNameStatus] = useState(null);
  const departmentsAvailable = [
    'Computer Science',
    'Mathematics',
    'Data Science',
    'AI',
  ];
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { addNotification } = useContext(NotificationContext);
  const trainerId = 'current-user-id'; // Replace with actual trainer ID

  const checkFormationName = async (name) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/proposeFormation`, {
        name,
        trainerId,
        checkOnly: true,
      });
      setNameStatus('valid');
    } catch {
      setNameStatus('invalid');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        departments: checked
          ? [...prev.departments, value]
          : prev.departments.filter((d) => d !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === 'name' && value) {
        checkFormationName(value);
      }
    }
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nameStatus !== 'valid') {
      setError('Formation name is invalid or already exists.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/proposeFormation`, {
        ...formData,
        trainerId,
      });
      setSuccess('Formation proposal sent!');
      addNotification(`Formation "${formData.name}" proposal sent.`);
      setFormData({
        name: '',
        durationStart: '',
        durationEnd: '',
        capacity: '',
        departments: [],
        details: '',
      });
      setNameStatus(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send formation proposal');
      console.error('Error sending formation proposal:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      durationStart: '',
      durationEnd: '',
      capacity: '',
      departments: [],
      details: '',
    });
    setNameStatus(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="center-content">
      <h1>Propose a Formation</h1>
      <div className="form-container">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-field">
            <label htmlFor="name" className="form-label">
              Formation Name
            </label>
            <div className="flex items-center">
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
              {nameStatus === 'valid' && (
                <span className="ml-2 text-green-500">✔</span>
              )}
              {nameStatus === 'invalid' && (
                <span className="ml-2 text-red-500">✖</span>
              )}
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="durationStart" className="form-label">
              Duration Start
            </label>
            <input
              id="durationStart"
              type="date"
              name="durationStart"
              value={formData.durationStart}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label htmlFor="durationEnd" className="form-label">
              Duration End
            </label>
            <input
              id="durationEnd"
              type="date"
              name="durationEnd"
              value={formData.durationEnd}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label htmlFor="capacity" className="form-label">
              Capacity
            </label>
            <input
              id="capacity"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Departments</label>
            {departmentsAvailable.map((dept) => (
              <div key={dept} className="flex items-center">
                <input
                  type="checkbox"
                  id={`dept-${dept}`}
                  value={dept}
                  checked={formData.departments.includes(dept)}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`dept-${dept}`} className="ml-2 text-sm text-gray-700">
                  {dept}
                </label>
              </div>
            ))}
          </div>
          <div className="form-field">
            <label htmlFor="details" className="form-label">
              Details
            </label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
            ></textarea>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="form-button">
              Send
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="form-button"
              style={{ background: '#DC2626' }}
            >
              Deny
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormationProposal;