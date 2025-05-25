import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import HomePage from './Pages/HomePage';
import RegistrationPage from './Pages/RegistrationPage';
import StudentRegistrationForm from './Components/StudentRegistrationForm';
import TeacherRegistrationForm from './Components/TeacherRegistrationForm';
import TrainerRegistrationForm from './Components/TrainerRegistrationForm';
import AdminRegistrationForm from './Components/AdminRegistrationForm';
import GuestRegistrationForm from './Components/GuestRegistrationForm';
import LoginForm from './Components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import Dashboard from './Pages/Dashboard';
import './styles.css';

function About() {
  return <div className="dashboard-section"><h2>About E.4C</h2><p>Learn more about our mission.</p></div>;
}

function Contact() {
  return <div className="dashboard-section"><h2>Contact Us</h2><p>Reach out to our team.</p></div>;
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signup" element={<RegistrationPage />} />
            <Route path="/signup/student" element={<StudentRegistrationForm />} />
            <Route path="/signup/teacher" element={<TeacherRegistrationForm />} />
            <Route path="/signup/trainer" element={<TrainerRegistrationForm />} />
            <Route path="/signup/admin" element={<AdminRegistrationForm />} />
            <Route path="/signup/guest" element={<GuestRegistrationForm />} />
            <Route path="/login/:userType" element={<LoginForm />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm setShowForgotPassword={() => {}} />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;