import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications([...notifications, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      <div>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '1rem',
              background: notif.type === 'success' ? '#10b981' : '#ef4444',
              color: '#fff',
              borderRadius: '4px',
              zIndex: 1000,
              minWidth: '200px',
            }}
          >
            {notif.message}
          </div>
        ))}
        {children}
      </div>
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};