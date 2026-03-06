import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Contexto de Autenticación
import { AuthProvider, AuthContext } from './context/AuthContext';
// Estilos
import './styles/App.css';
// Componentes de Layout y Rutas
import Header from './components/layout/Header/Header.tsx';
import Menu from './components/layout/Menu/Menu.tsx';
import Footer from './components/layout/Footer/Footer.tsx';
import ErrorBoundary from './components/layout/ErrorBoundary.tsx';
import ProtectedRoute from './components/protectedRoute/ProtectedRoute.tsx';

// Páginas
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/Login.tsx';
import ClothingPage from './pages/ClothingPage.tsx';
import CategoryPage from "./pages/CategoryPage.tsx";
import RolePage from './pages/RolePage.tsx';
import UserPage from './pages/UserPage.tsx';
import UserRolePage from './pages/UserRolePage.tsx';
import TypeClothingPage from './pages/TypeClothingPage.tsx';
import MasterDesignPage from './pages/MasterDesignPage.tsx';
import SeasonPage from './pages/SeasonPage.tsx';
import YearProductionPage from './pages/YearProductionPage.tsx';
import CollectionPage from "./pages/CollectionPage.tsx";
import ProviderPage from './pages/ProviderPage.tsx';
import ProductionTypePage from './pages/ProductionTypePage.tsx';
import ErrorLogPage from './pages/ErrorLogPage.tsx';
import DesignProviderPage from './pages/DesignProviderPage.tsx';
import ClothingColorPage from "./pages/ClothingColorPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import ColorPage from './pages/ColorPage.tsx';
import PlanEstrategicoPage from './pages/PlanEstrategicoPage.tsx';
import OrderPage from './pages/OrderPage.tsx';
import OrderDetailPage from './pages/OrderDetailPage.tsx';
import LocationPage from './pages/LocationPage.tsx';
import LocationDetailPage from './pages/LocationDetailPage.tsx';
import StockPage from './pages/StockPage.tsx';
import ImageClothingPage from './pages/ImageClothingPage.tsx';
import GeneralSalesReportPage from './pages/GeneralSalesReportPage.tsx';
import SubscriberPage from './pages/SubscriberPage.tsx';
import PqrManagementPage from './pages/pqr/index.tsx';

/**
 * Componente que hace scroll al inicio de la página
 * cada vez que cambia la ruta.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

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

    const handleClick = (e) => {
      console.log('Global click detected:', e.target, 'DefaultPrevented:', e.defaultPrevented);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
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
              <Route path="/clothing-color" element={<ClothingColorPage />} />
              <Route path="/image-clothing" element={<ImageClothingPage />} />
              <Route path="/image-clothing/:id" element={<ImageClothingPage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/color" element={<ColorPage />} />
              <Route path="/plan-estrategico" element={<PlanEstrategicoPage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/order/:id" element={<OrderDetailPage />} />
              <Route path="/locations" element={<LocationPage />} />
              <Route path="/locations/:id" element={<LocationDetailPage />} />
              <Route path="/stock" element={<StockPage />} />
              <Route path="/reports/sales/general" element={<GeneralSalesReportPage />} />
              <Route path="/subscriber" element={<SubscriberPage />} />
              <Route path="/pqr" element={<PqrManagementPage />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
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
