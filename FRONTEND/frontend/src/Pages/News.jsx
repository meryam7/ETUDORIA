import React, { useState, useEffect } from 'react';
import axios from 'axios';

function News() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/news`);
        setNews(response.data);
      } catch (err) {
        console.error('Error fetching news:', err);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="center-content">
      <h1>News</h1>
      {news.length === 0 ? (
        <p>No news available.</p>
      ) : (
        <div className="news-list">
          {news.map(n => (
            <div key={n.id} className="news-item">
              <p>{n.content}</p>
              <p><em>Posted on: {new Date(n.timestamp).toLocaleString()}</em></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default News;