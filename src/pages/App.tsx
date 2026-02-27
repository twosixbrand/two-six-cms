import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Contexto de Autenticación
import { AuthProvider, AuthContext } from '../context/AuthContext';
// Styles
import "../styles/App.css";
// Layout Components
import Header from "../components/layout/Header/Header";
import Menu from "../components/layout/Menu/Menu";
import Footer from "../components/layout/Footer/Footer";
import ErrorBoundary from "../components/layout/ErrorBoundary";
import ProtectedRoute from '../components/protectedRoute/ProtectedRoute';

// Page Components
import HomePage from './HomePage';
import LoginPage from './Login';
import ClothingPage from './ClothingPage';
import CategoryPage from "./CategoryPage";
import RolePage from './RolePage';
import UserPage from './UserPage';
import UserRolePage from './UserRolePage';
import TypeClothingPage from './TypeClothingPage';
import MasterDesignPage from './MasterDesignPage';
import SeasonPage from './SeasonPage';
import YearProductionPage from './YearProductionPage';
import CollectionPage from "./CollectionPage";
import ProviderPage from './ProviderPage';
import ProductionTypePage from './ProductionTypePage';
import ErrorLogPage from './ErrorLogPage';
import DesignProviderPage from './DesignProviderPage';
// import DesignClothingPage from "./DesignClothingPage";
import ProductPage from "./ProductPage";
import ColorPage from './ColorPage'; // <-- Importación añadida

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
                        {/* <Route path="/design-clothing" element={<DesignClothingPage />} /> */}
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
