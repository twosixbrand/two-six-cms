import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClothingPage from './pages/ClothingPage.jsx';
import Menu from './components/layout/Menu/Menu.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import './styles/App.css';
import HomePage from './pages/HomePage.jsx';
import Footer from './components/layout/Footer/Footer.jsx';
import TypeClothingPage from './pages/TypeClothingPage.jsx';
import ErrorLogPage from './pages/ErrorLogPage.jsx';
import ErrorBoundary from './components/layout/ErrorBoundary.jsx';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Menu />
        <div className="app-content">
          <div className="container">
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/clothing" element={<ClothingPage />} />
                <Route path="/type-clothing" element={<TypeClothingPage />} />
                <Route path="/category" element={<CategoryPage />} />
                <Route path="/logs" element={<ErrorLogPage />} />
              </Routes>
            </main>
          </div>
        </div>
        <Footer />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
