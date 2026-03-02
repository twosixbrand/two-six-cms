import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaTshirt,
  FaPaintBrush,
  FaIndustry,
  FaPalette,
  FaImage,
  FaBoxOpen,
  FaWarehouse,
  FaExclamationTriangle,
  FaEyeDropper
} from 'react-icons/fa';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container page-container">

      <h1>Páginas Principales</h1>
      <div className="home-cards">
        <Link to="/clothing" className="home-card">
          <div className="card-watermark"><FaTshirt /></div>
          <div className="card-icon-container"><FaTshirt /></div>
          <h2>Clothing Management</h2>
          <p>Manage your clothing inventory, sizes, colors, and stock.</p>
        </Link>
        <Link to="/master-design" className="home-card">
          <div className="card-watermark"><FaPaintBrush /></div>
          <div className="card-icon-container"><FaPaintBrush /></div>
          <h2>Master Design Management</h2>
          <p>Create and manage master designs.</p>
        </Link>
        <Link to="/design-provider" className="home-card">
          <div className="card-watermark"><FaIndustry /></div>
          <div className="card-icon-container"><FaIndustry /></div>
          <h2>Design Provider Management</h2>
          <p>Assign providers to your master designs.</p>
        </Link>
        <Link to="/clothing-color" className="home-card">
          <div className="card-watermark"><FaPalette /></div>
          <div className="card-icon-container"><FaPalette /></div>
          <h2>Clothing Color Management</h2>
          <p>Manage the specific variations (color/size) of your designs.</p>
        </Link>
        <Link to="/image-clothing" className="home-card">
          <div className="card-watermark"><FaImage /></div>
          <div className="card-icon-container"><FaImage /></div>
          <h2>Image Clothing Management</h2>
          <p>Manage images for clothing variants.</p>
        </Link>
        <Link to="/product" className="home-card">
          <div className="card-watermark"><FaBoxOpen /></div>
          <div className="card-icon-container"><FaBoxOpen /></div>
          <h2>Product Management</h2>
          <p>Manage final products available for sale.</p>
        </Link>
        <Link to="/stock" className="home-card">
          <div className="card-watermark"><FaWarehouse /></div>
          <div className="card-icon-container"><FaWarehouse /></div>
          <h2>Stock Management</h2>
          <p>Manage inventory levels for your clothing variants.</p>
        </Link>
        <Link to="/logs" className="home-card">
          <div className="card-watermark"><FaExclamationTriangle /></div>
          <div className="card-icon-container"><FaExclamationTriangle /></div>
          <h2>Error Logs</h2>
          <p>View and filter application error logs for debugging.</p>
        </Link>
        <Link to="/color" className="home-card">
          <div className="card-watermark"><FaEyeDropper /></div>
          <div className="card-icon-container"><FaEyeDropper /></div>
          <h2>Color Management</h2>
          <p>Manage the available colors for products.</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;