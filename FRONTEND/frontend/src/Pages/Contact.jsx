import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { NotificationContext } from '../contexts/NotificationContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';

function Contact() {
  const [showCompose, setShowCompose] = useState(false);
  const [contactType, setContactType] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [message, setMessage] = useState('');
  const [sentMessages, setSentMessages] = useState([]);
  const { addNotification } = useContext(NotificationContext);
  const { isAuthenticated, user } = useContext(AuthContext);
  const location = useLocation();

  // Simulated teachers list
  const teachers = ['Teacher A', 'Teacher B', 'Teacher C'];

  // Handle initial contact type from navigation
  useEffect(() => {
    if (location.state?.contactType && isAuthenticated) {
      if (
        (location.state.contactType === 'Contact Admin' && (user.userType === 'Teacher' || user.userType === 'Admin')) ||
        (location.state.contactType === 'Contact Teacher')
      ) {
        setContactType(location.state.contactType);
        setShowCompose(true);
      } else {
        addNotification('Access denied for your user type.');
      }
    }
  }, [location.state, isAuthenticated, user, addNotification]);

  // Simulate replies (for demo)
  useEffect(() => {
    if (sentMessages.length > 0) {
      const lastMessage = sentMessages[sentMessages.length - 1];
      const timer = setTimeout(() => {
        setSentMessages((prev) =>
          prev.map((msg) =>
            msg.id === lastMessage.id
              ? {
                  ...msg,
                  replies: [
                    ...(msg.replies || []),
                    {
                      sender: msg.recipient === 'Admin' ? 'Admin' : msg.recipient,
                      content: `Reply to your message: Thank you for your message!`,
                      date: new Date().toISOString(),
                    },
                  ],
                }
              : msg
          )
        );
        addNotification(`${lastMessage.recipient} answered you on ${new Date().toLocaleDateString()}`);
      }, 2000); // Simulate reply after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [sentMessages, addNotification]);

  const handleSend = () => {
    if (!isAuthenticated) {
      addNotification('Please log in to send a message.');
      return;
    }
    if (!contactType || (contactType === 'Contact Teacher' && !selectedTeacher) || !message) {
      addNotification('Please fill all fields.');
      return;
    }
    if (contactType === 'Contact Admin' && !(user.userType === 'Teacher' || user.userType === 'Admin')) {
      addNotification('Access denied for your user type.');
      return;
    }

    const recipient = contactType === 'Contact Admin' ? 'Admin' : selectedTeacher;
    const newMessage = {
      id: Date.now(),
      recipient,
      content: message,
      date: new Date().toISOString(),
      replies: [],
    };

    setSentMessages([...sentMessages, newMessage]);
    addNotification('Your message has been sent.');
    setShowCompose(false);
    setContactType('');
    setSelectedTeacher('');
    setMessage('');
  };

  const handleDeny = () => {
    setShowCompose(false);
    setContactType('');
    setSelectedTeacher('');
    setMessage('');
  };

  if (!isAuthenticated) {
    return (
      <div className="center-content">
        <h1>Contact</h1>
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="center-content">
      <h1>Contact</h1>
      <button className="button" onClick={() => setShowCompose(true)}>
        Compose
      </button>
      {showCompose && (
        <div className="contact-form">
          <div className="form-row">
            <label>Type of contact:</label>
            <select
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
            >
              <option value="">Select...</option>
              {user.userType === 'Teacher' || user.userType === 'Admin' ? (
                <option value="Contact Admin">Contact Admin</option>
              ) : null}
              <option value="Contact Teacher">Contact Teacher</option>
            </select>
            {contactType === 'Contact Admin' && <span>Admin</span>}
            {contactType === 'Contact Teacher' && (
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">Select Teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="form-row">
            <label>Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
            />
          </div>
          <div className="form-buttons">
            <button className="button" onClick={handleSend}>
              Send
            </button>
            <button className="button button-deny" onClick={handleDeny}>
              Deny
            </button>
          </div>
        </div>
      )}
      <div className="sent-messages">
        <h2>Sent Messages</h2>
        {sentMessages.length === 0 ? (
          <p>No messages sent.</p>
        ) : (
          sentMessages.map((msg) => (
            <div key={msg.id} className="message-item">
              <p>
                <strong>To:</strong> {msg.recipient}
              </p>
              <p>
                <strong>Date:</strong> {new Date(msg.date).toLocaleString()}
              </p>
              <p>
                <strong>Message:</strong> {msg.content}
              </p>
              {msg.replies?.map((reply, index) => (
                <div key={index} className="message-reply">
                  <p>
                    <strong>From:</strong> {reply.sender}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(reply.date).toLocaleString()}
                  </p>
                  <p>
                    <strong>Reply:</strong> {reply.content}
                  </p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Contact;