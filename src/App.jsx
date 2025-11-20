import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contexto de Autenticación
import { AuthProvider, AuthContext } from './context/AuthContext';

// Componentes de Layout y Rutas
import Header from './components/layout/Header/Header.jsx';
import Menu from './components/layout/Menu/Menu.jsx';
import Footer from './components/layout/Footer/Footer.jsx';
import ErrorBoundary from './components/layout/ErrorBoundary.jsx';
import ProtectedRoute from './components/protectedRoute/ProtectedRoute.jsx';

// Páginas
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/Login.jsx';
import ClothingPage from './pages/ClothingPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import RolePage from './pages/RolePage.jsx';
import UserPage from './pages/UserPage.jsx';
import UserRolePage from './pages/UserRolePage.jsx';
import TypeClothingPage from './pages/TypeClothingPage.jsx';
import MasterDesignPage from './pages/MasterDesignPage.jsx';
import SeasonPage from './pages/SeasonPage.jsx';
import YearProductionPage from './pages/YearProductionPage.jsx';
import CollectionPage from './pages/CollectionPage.jsx';
import ProviderPage from './pages/ProviderPage.jsx';
import ProductionTypePage from './pages/ProductionTypePage.jsx';
import ErrorLogPage from './pages/ErrorLogPage.jsx';
import DesignProviderPage from './pages/DesignProviderPage.jsx';
import DesignClothingPage from './pages/DesignClothingPage.jsx';
import ProductPage from './pages/ProductPage.jsx';

// Estilos
import './styles/App.css';

/**
 * Componente que renderiza el layout principal (Menú, Contenido, Footer)
 * solo si el usuario está autenticado.
 */
const MainLayout = () => {
  const [isMenuOpen, setMenuOpen] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return null; // No renderizar nada si no está autenticado
  }
  
  return (
    <>
      <Header toggleMenu={() => setMenuOpen(!isMenuOpen)} />
      <Menu isMenuOpen={isMenuOpen} toggleMenu={() => setMenuOpen(!isMenuOpen)} />
        <div className={`app-content ${!isMenuOpen ? 'menu-closed' : ''}`}>
            <div className="container">
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/clothing" element={<ClothingPage />} />
                        <Route path="/type-clothing" element={<TypeClothingPage />} />
                        <Route path="/category" element={<CategoryPage />} />
                        <Route path="/season" element={<SeasonPage />} />
                        <Route path="/year-production" element={<YearProductionPage />} />
                        <Route path="/provider" element={<ProviderPage />} />
                        <Route path="/collection" element={<CollectionPage />} />
                        <Route path="/master-design" element={<MasterDesignPage />} />
                        <Route path="/role" element={<RolePage />} />
                        <Route path="/user" element={<UserPage />} />
                        <Route path="/user-role" element={<UserRolePage />} />
                        <Route path="/logs" element={<ErrorLogPage />} />
                        <Route path="/production-type" element={<ProductionTypePage />} />
                        <Route path="/design-provider" element={<DesignProviderPage />} />
                        <Route path="/design-clothing" element={<DesignClothingPage />} />
                        <Route path="/product" element={<ProductPage />} />
                    </Routes>
                </main>
            </div>
        </div>
      <Footer />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Ruta pública para el login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Cualquier otra ruta estará protegida */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
