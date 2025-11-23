import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Contexto de Autenticación
import { AuthProvider, AuthContext } from '../context/AuthContext';
// Styles
import "../styles/App.css";
// Layout Components
import Header from "../components/layout/Header/Header.jsx";
import Menu from "../components/layout/Menu/Menu.jsx";
import Footer from "../components/layout/Footer/Footer.jsx";
import ErrorBoundary from "../components/layout/ErrorBoundary.jsx";
import ProtectedRoute from '../components/protectedRoute/ProtectedRoute.jsx';

// Page Components
import HomePage from './HomePage.jsx';
import LoginPage from './Login.jsx';
import ClothingPage from './ClothingPage.jsx';
import CategoryPage from "./CategoryPage.jsx";
import RolePage from './RolePage.jsx';
import UserPage from './UserPage.jsx';
import UserRolePage from './UserRolePage.jsx';
import TypeClothingPage from './TypeClothingPage.jsx';
import MasterDesignPage from './MasterDesignPage.jsx';
import SeasonPage from './SeasonPage.jsx';
import YearProductionPage from './YearProductionPage.jsx';
import CollectionPage from "./CollectionPage.jsx";
import ProviderPage from './ProviderPage.jsx';
import ProductionTypePage from './ProductionTypePage.jsx';
import ErrorLogPage from './ErrorLogPage.jsx';
import DesignProviderPage from './DesignProviderPage.jsx';
import DesignClothingPage from "./DesignClothingPage.jsx";
import ProductPage from "./ProductPage.jsx";
import ColorPage from './ColorPage.jsx'; // <-- Importación añadida

/**
 * Componente que renderiza el layout principal (Menú, Contenido, Footer)
 * solo si el usuario está autenticado.
 */
const MainLayout = () => {
  const [isMenuOpen, setMenuOpen] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    // Este mensaje debe aparecer en la consola si se carga la versión correcta.
    console.log('¡MainLayout cargado correctamente! Versión: ', new Date().toLocaleTimeString());
  }, []);

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
                        <Route path="/color" element={<ColorPage />} /> {/* <-- Ruta añadida */}
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
