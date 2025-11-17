import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      
      <p className="home-subtitle">Páginas Principales</p>
      <div className="home-cards">
        <Link to="/clothing" className="home-card">
          <h2>Clothing Management</h2>
          <p>Manage your clothing inventory, sizes, colors, and stock.</p>
        </Link>
        <Link to="/master-design" className="home-card">
          <h2>Master Design Management</h2>
          <p>Create and manage master designs.</p>
        </Link>
        <Link to="/design-provider" className="home-card">
          <h2>Design Provider Management</h2>
          <p>Assign providers to your master designs.</p>
        </Link>
        <Link to="/design-clothing" className="home-card">
          <h2>Design Clothing Management</h2>
          <p>Manage the specific variations (color/size) of your designs.</p>
        </Link>
        <Link to="/product" className="home-card">
          <h2>Product Management</h2>
          <p>Manage final products available for sale.</p>
        </Link>
        <Link to="/logs" className="home-card">
          <h2>Error Logs</h2>
          <p>View and filter application error logs for debugging.</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;