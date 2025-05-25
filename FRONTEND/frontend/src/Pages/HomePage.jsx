import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';


function HomePage() {
  return (
    <div className="home-page">
      <Navbar />
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to E.4C</h1>
          <p className="hero-subtitle">
            Empower your future with learning, teaching, and community collaboration.
          </p>
          <Link to="/signup" className="join-us-button">
            Join Us
          </Link>
        </div>
      </header>
      <section className="features-section">
        <h2 className="features-title">Why Choose E.4C?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3 className="feature-title">Learn Anywhere</h3>
            <p className="feature-description">
              Access courses and resources from any device, anytime.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Expert Instructors</h3>
            <p className="feature-description">
              Learn from industry professionals and experienced educators.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Vibrant Community</h3>
            <p className="feature-description">
              Connect with peers, share knowledge, and grow together.
            </p>
          </div>
        </div>
      </section>
      <section className="cta-section">
        <h2 className="cta-title">Ready to Get Started?</h2>
        <p className="cta-description">
          Join E.4C today and take the first step toward your educational journey.
        </p>
        <Link to="/signup" className="cta-button">
          Sign Up Now
        </Link>
      </section>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">E.4C</h3>
            <p>Empowering Education, Connecting Communities.</p>
          </div>
          <div className="footer-section">
            <h3 className="footer-title">Links</h3>
            <ul className="footer-links">
              <li><Link to="/about" className="footer-link">About</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
              <li><Link to="/signup" className="footer-link">Sign Up</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3 className="footer-title">Contact</h3>
            <p>Email: support@e4c.com</p>
            <p>Phone: (123) 456-7890</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 E.4C. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;