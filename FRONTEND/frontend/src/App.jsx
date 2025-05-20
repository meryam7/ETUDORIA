import React from 'react';
import './styles.css';

const App = () => {
  return (
    <div className="page-container">
      <nav className="navbar">
        <div className="container15">
          <a href="/" className="navbar-logo">Etudoria</a>
          <div className="navbar-links">
            <div className="nav-item">
              <a href="/home" className="nav-icon" data-name="Home">🏠</a>
            </div>
            <div className="nav-item">
              <a href="/courses" className="nav-icon" data-name="Courses">📚</a>
            </div>
            <div className="nav-item">
              <a href="/community" className="nav-icon" data-name="Community">👥</a>
            </div>
          </div>
          <div className="navbar-support">
            <a href="/support" className="support-button">Support</a>
          </div>
          <div className="navbar-auth">
            <button className="button">Login</button>
            <button className="button">Sign Up</button>
          </div>
        </div>
      </nav>
      <section className="welcome-container">
        <div className="welcome-content">
          <h1 className="welcome-title">Empower Your Future with Etudoria</h1>
          <p className="welcome-subtitle">Join our platform to access top-tier educational resources and unlock your potential.</p>
          <a href="/signup" className="welcome-button">Get Started</a>
        </div>
        <img src="/assets/welcome-image.jpg" alt="Welcome" className="welcome-image" />
      </section>
      <section className="ads-section">
        <h2 className="ads-title">Latest News & Updates</h2>
        <div className="ads-grid">
          <div className="ads-card">
            <div className="ads-content">
              <h3 className="ads-card-title">New AI Course Launched</h3>
              <p className="ads-card-text">Explore our cutting-edge course on Artificial Intelligence and Machine Learning.</p>
              <a href="/news/ai-course" className="ads-card-link">Read More</a>
            </div>
          </div>
          <div className="ads-card">
            <div className="ads-content">
              <h3 className="ads-card-title">Webinar Series Announced</h3>
              <p className="ads-card-text">Join our upcoming webinars on career development and skill-building.</p>
              <a href="/news/webinars" className="ads-card-link">Learn More</a>
            </div>
          </div>
        </div>
      </section>
      <section className="achievements-section">
        <h2 className="achievements-title">4C Kairouan Achievements</h2>
        <div className="achievements-grid">
          <div className="achievements-card">
            <div className="achievements-content">
              <h3 className="achievements-card-title">Top Regional Ranking</h3>
              <p className="achievements-card-text">4C Kairouan ranked #1 in educational innovation in 2025.</p>
              <a href="/achievements/ranking" className="achievements-card-link">Discover More</a>
            </div>
          </div>
          <div className="achievements-card">
            <div className="achievements-content">
              <h3 className="achievements-card-title">Student Success Stories</h3>
              <p className="achievements-card-text">Over 500 students excelled in national exams with our support.</p>
              <a href="/achievements/stories" className="achievements-card-link">Read Stories</a>
            </div>
          </div>
        </div>
      </section>
      <section className="impact-section">
        <h2 className="impact-title">Impact on Student Success</h2>
        <div className="impact-grid">
          <div className="impact-card">
            <div className="impact-content">
              <h3 className="impact-card-title">Improved Learning Outcomes</h3>
              <p className="impact-card-text">Our platform boosts student performance by 30% through personalized learning.</p>
              <a href="/impact/outcomes" className="impact-card-link">See How</a>
            </div>
          </div>
          <div className="impact-card">
            <div className="impact-content">
              <h3 className="impact-card-title">Career Readiness</h3>
              <p className="impact-card-text">90% of students report better job prospects after using Etudoria.</p>
              <a href="/impact/careers" className="impact-card-link">Explore Benefits</a>
            </div>
          </div>
        </div>
      </section>
      <section className="news-section">
        <h2 className="news-title">More News</h2>
        <div className="news-grid">
          {/* Add your existing news cards here */}
        </div>
      </section>
      <section className="org-section">
        <h2 className="org-title">Our Organization</h2>
        <div className="org-grid">
          {/* Add your existing org cards here */}
        </div>
      </section>
    </div>
  );
};

export default App;