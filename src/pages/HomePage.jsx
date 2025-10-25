import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <h1>Welcome to TwoSix CMS</h1>
      <p className="home-subtitle">Manage your content with ease.</p>
      <div className="home-cards">
        <Link to="/clothing" className="home-card">
          <h2>Clothing Management</h2>
          <p>Manage your clothing inventory, sizes, colors, and stock.</p>
        </Link>
        <Link to="/category" className="home-card">
          <h2>Category Management</h2>
          <p>Organize your products by creating and managing categories.</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;