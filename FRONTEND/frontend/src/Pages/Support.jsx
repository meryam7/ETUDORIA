import React from 'react';
import { Link } from 'react-router-dom';

function Support() {
  return (
    <div className="support-container">
      <h1 className="support-title">Support & Services</h1>
      <div className="support-content">
        <section className="support-section">
          <h2>About Etudoria</h2>
          <p>
            Etudoria is your premier platform for online learning, offering a wide range of courses taught by expert instructors. Whether you are a student, teacher, or professional, we provide tools and resources to help you succeed.
          </p>
        </section>
        <section className="support-section">
          <h2>Our Services</h2>
          <ul>
            <li>Comprehensive course catalog across Math, Science, History, and more.</li>
            <li>Interactive dashboards for students, teachers, trainers, and admins.</li>
            <li>Real-time notifications and announcements.</li>
            <li>Support for course proposals and professional development.</li>
          </ul>
        </section>
        <section className="support-section">
          <h2>Contact Us</h2>
          <p>
            Need assistance? <Link to="/contact">Contact our admin or teachers</Link> for personalized support.
          </p>
        </section>
        <section className="support-section">
          <h2>Get Started</h2>
          <p>
            Ready to join? <Link to="/signup">Sign up now</Link> to explore our platform and start learning!
          </p>
        </section>
      </div>
    </div>
  );
}

export default Support;