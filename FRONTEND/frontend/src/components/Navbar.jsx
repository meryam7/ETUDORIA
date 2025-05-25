import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaInfoCircle, FaHome, FaBell, FaBook, FaSearch } from 'react-icons/fa';
import { NotificationContext } from '../contexts/NotificationContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';

function Navbar() {
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [showCoursesDropdown, setShowCoursesDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const { notifications, addNotification, clearNotifications } = useContext(NotificationContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleContactClick = (action) => {
    if (!user) {
      addNotification('Please register or log in to access this feature.');
      setShowContactDropdown(false);
    } else if (user.userType === 'Student' && action === 'Contact Teacher') {
      navigate('/contact', { state: { contactType: action } });
    } else if (user.userType === 'Teacher' || user.userType === 'Admin') {
      navigate('/contact', { state: { contactType: action } });
    } else {
      addNotification('Access denied for your user type.');
    }
  };

  const handleCourseClick = (course) => {
    if (!user) {
      addNotification('Please register or log in to access this feature.');
      setShowCoursesDropdown(false);
    } else if (user.userType === 'Student' || user.userType === 'Teacher' || user.userType === 'Trainer') {
      console.log(`Selected course: ${course}`);
      if (user.userType === 'Student') {
        console.log('Student can download course materials');
      }
    } else {
      addNotification('Access denied for your user type.');
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-logo">E.4C</Link>
        <div className="navbar-links">
          <div
            className="nav-item"
            onMouseEnter={() => setShowContactDropdown(true)}
            onMouseLeave={() => setShowContactDropdown(false)}
          >
            <FaInfoCircle
              className="nav-icon"
              onClick={() => user && navigate('/contact')}
              data-name="Contact"
            />
            {showContactDropdown && (
              <div className="dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => handleContactClick('Contact Admin')}
                >
                  Contact Admin
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleContactClick('Contact Teacher')}
                >
                  Contact Teacher
                </button>
              </div>
            )}
          </div>
          <div className="nav-item">
            <Link to="/">
              <FaHome className="nav-icon" data-name="Home" />
            </Link>
          </div>
          <div
            className="nav-item"
            onMouseEnter={() => setShowCoursesDropdown(true)}
            onMouseLeave={() => setShowCoursesDropdown(false)}
          >
            <FaBook
              className="nav-icon"
              data-name="Courses"
            />
            {showCoursesDropdown && (
              <div className="dropdown">
                {['Math 101', 'Science 202', 'History 303'].map((course) => (
                  <button
                    key={course}
                    className="dropdown-item"
                    onClick={() => handleCourseClick(course)}
                  >
                    {course}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            className="nav-item"
            onMouseEnter={() => setShowNotificationsDropdown(true)}
            onMouseLeave={() => setShowNotificationsDropdown(false)}
          >
            <div className="notification-wrapper">
              <FaBell
                className="nav-icon"
                data-name="Notifications"
              />
              {notifications.length > 0 && <span className="notification-dot"></span>}
            </div>
            {showNotificationsDropdown && (
              <div className="dropdown">
                {notifications.length === 0 ? (
                  <div className="dropdown-item">No notifications</div>
                ) : (
                  <>
                    {notifications.map((notif) => (
                      <div key={notif.id} className="dropdown-item">
                        {notif.message}
                      </div>
                    ))}
                    <button
                      className="dropdown-item dropdown-clear"
                      onClick={clearNotifications}
                    >
                      Clear Notifications
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="nav-item search-container">
            {showSearchInput ? (
              <div className="search-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search..."
                  onBlur={() => setShowSearchInput(false)}
                  autoFocus
                />
              </div>
            ) : (
              <FaSearch
                className="nav-icon"
                onClick={() => setShowSearchInput(true)}
                data-name="Search"
              />
            )}
          </div>
          {user && user.userType === 'Teacher' && (
            <div className="nav-item">
              <Link to="/teacher/announce">
                <span className="nav-icon" data-name="Announce Test">📢</span>
              </Link>
            </div>
          )}
          {user && user.userType === 'Trainer' && (
            <div className="nav-item">
              <Link to="/trainer/formation">
                <span className="nav-icon" data-name="Propose Formation">📝</span>
              </Link>
            </div>
          )}
          {user && user.userType === 'Admin' && (
            <div className="nav-item">
              <Link to="/admin/dashboard">
                <span className="nav-icon" data-name="Dashboard">📊</span>
              </Link>
            </div>
          )}
        </div>
        <div className="navbar-support">
          <Link to="/support" className="support-button">Support</Link>
          {user ? (
            <div className="navbar-auth">
              <span>Welcome, {user.email}</span>
              <button
                className="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;