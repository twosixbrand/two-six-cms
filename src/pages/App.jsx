import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Styles
import "../styles/App.css";
// Layout Components
import Menu from "../components/layout/Menu/Menu.jsx";
import Footer from "../components/layout/Footer/Footer.jsx";
import ErrorBoundary from "../components/layout/ErrorBoundary.jsx";

// Page Components
import HomePage from "./HomePage.jsx";
import ClothingPage from "./ClothingPage.jsx";
import TypeClothingPage from "./TypeClothingPage.jsx";
import CategoryPage from "./CategoryPage.jsx";
import SeasonPage from "./SeasonPage.jsx";
import CollectionPage from "./CollectionPage.jsx";
import RolePage from "./RolePage.jsx";
import UserPage from "./UserPage.jsx";
import UserRolePage from "./UserRolePage.jsx";
import MasterDesignPage from "./MasterDesignPage.jsx";
import ProductionTypePage from "./ProductionTypePage.jsx";
import ProviderPage from "./ProviderPage.jsx";
import DesignProviderPage from "./DesignProviderPage.jsx";
import DesignClothingPage from "./DesignClothingPage.jsx";
import ProductPage from "./ProductPage.jsx";
import ErrorLogPage from "./ErrorLogPage.jsx";
import YearProductionPage from "./YearProductionPage.jsx";

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
                <Route path="/season" element={<SeasonPage />} />
                <Route
                  path="/year-production"
                  element={<YearProductionPage />}
                />
                <Route path="/provider" element={<ProviderPage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/master-design" element={<MasterDesignPage />} />
                <Route path="/role" element={<RolePage />} />
                <Route path="/user" element={<UserPage />} />
                <Route path="/user-role" element={<UserRolePage />} />
                <Route path="/logs" element={<ErrorLogPage />} />
                <Route
                  path="/production-type"
                  element={<ProductionTypePage />}
                />
                <Route
                  path="/design-provider"
                  element={<DesignProviderPage />}
                />
                <Route
                  path="/design-clothing"
                  element={<DesignClothingPage />}
                />
                <Route path="/product" element={<ProductPage />} />
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
