import React from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();

  const handleJoinUsClick = () => {
    console.log('Join Us button clicked, navigating to /signup');
    navigate('/signup');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Welcome to E.4C</h1>
        <p className="hero-subtitle">
          Discover a world of learning with our comprehensive courses, expert instructors, and vibrant community. Start your journey today!
        </p>
        <button
          className="join-us-button"
          onClick={handleJoinUsClick}
        >
          Join Us
        </button>
      </section>

      {/* Achievements Section */}
      <section className="section">
        <div className="container15">
          <h2 className="section-title">E.4C Achievements</h2>
          <div className="section-grid">
            <div className="section-card">
              <h3 className="section-card-title">Global Reach</h3>
              <p className="section-card-text">
                Over 10,000 students from 50+ countries have joined E.4C, creating a diverse and inclusive learning community.
              </p>
            </div>
            <div className="section-card">
              <h3 className="section-card-title">Award-Winning Courses</h3>
              <p className="section-card-text">
                Our courses have been recognized by leading educational bodies for innovation and excellence in online learning.
              </p>
            </div>
            <div className="section-card">
              <h3 className="section-card-title">High Completion Rates</h3>
              <p className="section-card-text">
                85% of our students complete their courses, thanks to engaging content and dedicated support from instructors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="section">
        <div className="container15">
          <h2 className="section-title">E.4C News</h2>
          <div className="section-grid">
            <div className="section-card">
              <h3 className="section-card-title">New Course Launch: AI Fundamentals</h3>
              <p className="section-card-text">
                We are excited to announce our new AI Fundamentals course, designed to equip learners with cutting-edge skills in artificial intelligence.
              </p>
              <a href="/news/ai-fundamentals" className="section-card-link">
                Read More
              </a>
            </div>
            <div className="section-card">
              <h3 className="section-card-title">Partnership with Tech Innovators</h3>
              <p className="section-card-text">
                E.4C has partnered with leading tech companies to provide real-world projects and mentorship opportunities for our students.
              </p>
              <a href="/news/tech-partnership" className="section-card-link">
                Read More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Future Plans Section */}
      <section className="section">
        <div className="container15">
          <h2 className="section-title">E.4C Future Plans</h2>
          <div className="section-grid">
            <div className="section-card">
              <h3 className="section-card-title">Expanded Course Catalog</h3>
              <p className="section-card-text">
                We plan to introduce 20+ new courses in emerging fields like blockchain, cybersecurity, and data science by 2026.
              </p>
            </div>
            <div className="section-card">
              <h3 className="section-card-title">Mobile App Launch</h3>
              <p className="section-card-text">
                A dedicated E.4C mobile app is in development, offering seamless learning on-the-go with offline access to course materials.
              </p>
            </div>
            <div className="section-card">
              <h3 className="section-card-title">Global Learning Hubs</h3>
              <p className="section-card-text">
                We are establishing physical learning hubs in key cities to complement our online platform with in-person workshops.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Welcome;