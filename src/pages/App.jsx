import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClothingPage from './ClothingPage.jsx';
import Menu from '../components/layout/Menu/Menu.jsx';
import CategoryPage from './CategoryPage.jsx';
import '../styles/App.css';
import HomePage from './HomePage.jsx';
import ErrorBoundary from '../components/layout/ErrorBoundary.jsx';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Menu />
        <div className="container">
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/clothing" element={<ClothingPage />} />
              <Route path="/category" element={<CategoryPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
