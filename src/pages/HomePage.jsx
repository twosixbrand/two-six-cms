import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      
      <p className="home-subtitle">Manage your content with ease.</p>
      <div className="home-cards">
        <Link to="/clothing" className="home-card">
          <h2>Clothing Management</h2>
          <p>Manage your clothing inventory, sizes, colors, and stock.</p>
        </Link>
        <Link to="/type-clothing" className="home-card">
          <h2>Type Clothing Management</h2>
          <p>Organize your type of clothing by creating and managing this types.</p>
        </Link>
         <Link to="/category" className="home-card">
          <h2>Category Management</h2>
          <p>Organize your products by creating and managing categories.</p>
        </Link>
         <Link to="/role" className="home-card">
          <h2>Role Management</h2>
          <p>Managing roles.</p>
        </Link>
        <Link to="/user" className="home-card">
          <h2>User Management</h2>
          <p>Create, edit, and delete users.</p>
        </Link>
        <Link to="/user-role" className="home-card">
          <h2>User Roles Management</h2>
          <p>Create, edit, and assign roles to users.</p>
        </Link>
        <Link to="/master-design" className="home-card">
          <h2>Master Design Management</h2>
          <p>Create and manage master designs.</p>
        </Link>
        <Link to="/season" className="home-card">
          <h2>Season Management</h2>
          <p>Manage the different seasons for your collections.</p>
        </Link>
        <Link to="/provider" className="home-card">
          <h2>Provider Management</h2>
          <p>Create and manage providers.</p>
        </Link>
        <Link to="/collection" className="home-card">
          <h2>Collection Management</h2>
          <p>Organize your designs into collections by season and year.</p>
        </Link>
        <Link to="/year-production" className="home-card">
          <h2>Year Production Management</h2>
          <p>Manage your production years.</p>
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