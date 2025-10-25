import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClothingPage from './pages/ClothingPage.jsx';
import Menu from './components/layout/Menu/Menu.jsx';
import ErrorBoundary from './components/layout/ErrorBoundary.jsx';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Menu />
        <main>
          <Routes>
            {/* La ruta raíz y /clothing mostrarán la misma página por ahora */}
            <Route path="/" element={<ClothingPage />} />
            <Route path="/clothing" element={<ClothingPage />} />
          </Routes>
        </main>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
