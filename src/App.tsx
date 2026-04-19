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
import TagPage from './pages/TagPage';
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
import StockPage from './pages/StockPage.tsx';
import ReportStockPage from './pages/ReportStockPage.tsx';
import ImageClothingPage from './pages/ImageClothingPage.tsx';
import GeneralSalesReportPage from './pages/GeneralSalesReportPage.tsx';
import SubscriberPage from './pages/SubscriberPage.tsx';
import PqrManagementPage from './pages/pqr/index.tsx';
import SizeGuidePage from './pages/SizeGuidePage.tsx';
import DianInvoicePage from './pages/DianInvoicePage';
import DianDocumentationPage from './pages/DianDocumentationPage.tsx';
import DatabaseDocumentationPage from './pages/DatabaseDocumentationPage';
import ArchitectureDocumentationPage from './pages/ArchitectureDocumentationPage';
import PickupDashboardPage from './pages/PickupDashboardPage.tsx';
import CustomerPage from './pages/CustomerPage.tsx';
import PermissionManagementPage from './pages/PermissionManagementPage.tsx';
import GoogleMerchantFeedPage from './pages/GoogleMerchantFeedPage.tsx';
import FacebookFeedPage from './pages/FacebookFeedPage.tsx';
import CouponPage from './pages/CouponPage.tsx';
import ConsignmentWarehousePage from './pages/consignment/ConsignmentWarehousePage.tsx';
import ConsignmentPricePage from './pages/consignment/ConsignmentPricePage.tsx';
import ConsignmentDispatchPage from './pages/consignment/ConsignmentDispatchPage.tsx';
import ConsignmentSelloutPage from './pages/consignment/ConsignmentSelloutPage.tsx';
import ConsignmentReturnPage from './pages/consignment/ConsignmentReturnPage.tsx';
import ConsignmentCycleCountPage from './pages/consignment/ConsignmentCycleCountPage.tsx';
import ConsignmentSellReportsPage from './pages/consignment/ConsignmentSellReportsPage.tsx';
import ConsignmentReportsPage from './pages/consignment/ConsignmentReportsPage.tsx';

// Accounting pages
import PucAccountPage from './pages/accounting/PucAccountPage.tsx';
import JournalEntryPage from './pages/accounting/JournalEntryPage.tsx';
import JournalEntryFormPage from './pages/accounting/JournalEntryFormPage.tsx';
import ExpensePage from './pages/accounting/ExpensePage.tsx';
import ExpenseFormPage from './pages/accounting/ExpenseFormPage.tsx';
import BalanceSheetPage from './pages/accounting/BalanceSheetPage.tsx';
import IncomeStatementPage from './pages/accounting/IncomeStatementPage.tsx';
import GeneralLedgerPage from './pages/accounting/GeneralLedgerPage.tsx';
import SubsidiaryLedgerPage from './pages/accounting/SubsidiaryLedgerPage.tsx';
import BankReconciliationPage from './pages/accounting/BankReconciliationPage.tsx';
import WithholdingCertificatePage from './pages/accounting/WithholdingCertificatePage.tsx';
import AuditLogPage from './pages/accounting/AuditLogPage.tsx';
import PeriodClosingPage from './pages/accounting/PeriodClosingPage.tsx';
import PayrollPage from './pages/accounting/PayrollPage.tsx';
import IvaDeclarationPage from './pages/accounting/IvaDeclarationPage.tsx';
import ReteFuentePage from './pages/accounting/ReteFuentePage.tsx';
import CashFlowPage from './pages/accounting/CashFlowPage.tsx';
import AgingReportPage from './pages/accounting/AgingReportPage.tsx';
import ExogenaPage from './pages/accounting/ExogenaPage.tsx';
import ManualContablePage from './pages/accounting/ManualContablePage.tsx';
import UserManualPage from './pages/UserManualPage.tsx';
import BudgetPage from './pages/accounting/BudgetPage.tsx';
import DepreciationPage from './pages/accounting/DepreciationPage.tsx';
import FinancialIndicatorsPage from './pages/accounting/FinancialIndicatorsPage.tsx';
import TaxConfigPage from './pages/accounting/TaxConfigPage.tsx';
import InventoryAdjustmentPage from './pages/accounting/InventoryAdjustmentPage.tsx';
import ProfitabilityReportPage from './pages/accounting/ProfitabilityReportPage.tsx';

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
              <Route path="/type-clothing" element={<ProtectedRoute permission="catalog.categories.view"><TypeClothingPage/></ProtectedRoute>} />
              <Route path="/tag" element={<ProtectedRoute permission="catalog.categories.view"><TagPage/></ProtectedRoute>} />
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
              <Route path="/dian-documentation" element={<DianDocumentationPage />} />
              <Route path="/database-docs" element={<DatabaseDocumentationPage />} />
              <Route path="/architecture-docs" element={<ArchitectureDocumentationPage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/order/:id" element={<OrderDetailPage />} />
              <Route path="/locations" element={<LocationPage />} />
              <Route path="/stock" element={<StockPage />} />
              <Route path="/reports/stock" element={<ReportStockPage />} />
              <Route path="/reports/sales/general" element={<GeneralSalesReportPage />} />
              <Route path="/reports/pickup-dashboard" element={<PickupDashboardPage />} />
              <Route path="/subscriber" element={<SubscriberPage />} />
              <Route path="/pqr" element={<PqrManagementPage />} />
              <Route path="/size-guide" element={<SizeGuidePage />} />
              <Route path="/dian-invoices" element={<DianInvoicePage />} />
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/permissions" element={<PermissionManagementPage />} />
              <Route path="/google-merchant-feed" element={<GoogleMerchantFeedPage />} />
              <Route path="/facebook-feed" element={<FacebookFeedPage />} />
              <Route path="/coupons" element={<CouponPage />} />
              {/* Consignment routes (Fase 1: F01, F02) */}
              <Route path="/consignment/warehouses" element={<ConsignmentWarehousePage />} />
              <Route path="/consignment/prices" element={<ConsignmentPricePage />} />
              <Route path="/consignment/dispatches" element={<ConsignmentDispatchPage />} />
              <Route path="/consignment/sellout" element={<ConsignmentSelloutPage />} />
              <Route path="/consignment/sell-reports" element={<ConsignmentSellReportsPage />} />
              <Route path="/consignment/returns" element={<ConsignmentReturnPage />} />
              <Route path="/consignment/cycle-counts" element={<ConsignmentCycleCountPage />} />
              <Route path="/consignment/reports" element={<ConsignmentReportsPage />} />
              {/* Accounting routes */}
              <Route path="/accounting/puc" element={<PucAccountPage />} />
              <Route path="/accounting/journal" element={<JournalEntryPage />} />
              <Route path="/accounting/journal/new" element={<JournalEntryFormPage />} />
              <Route path="/accounting/expenses" element={<ExpensePage />} />
              <Route path="/accounting/expenses/new" element={<ExpenseFormPage />} />
              <Route path="/accounting/expenses/:id" element={<ExpenseFormPage />} />
              <Route path="/accounting/balance-sheet" element={<BalanceSheetPage />} />
              <Route path="/accounting/income-statement" element={<IncomeStatementPage />} />
              <Route path="/accounting/general-ledger" element={<GeneralLedgerPage />} />
              <Route path="/accounting/subsidiary-ledger" element={<SubsidiaryLedgerPage />} />
              <Route path="/accounting/bank-reconciliation" element={<BankReconciliationPage />} />
              <Route path="/accounting/withholding-certificates" element={<WithholdingCertificatePage />} />
              <Route path="/accounting/audit-log" element={<AuditLogPage />} />
              <Route path="/accounting/closing" element={<PeriodClosingPage />} />
              <Route path="/accounting/payroll" element={<PayrollPage />} />
              <Route path="/accounting/tax/iva" element={<IvaDeclarationPage />} />
              <Route path="/accounting/tax/retefuente" element={<ReteFuentePage />} />
              <Route path="/accounting/reports/cash-flow" element={<CashFlowPage />} />
              <Route path="/accounting/reports/aging" element={<AgingReportPage />} />
              <Route path="/accounting/reports/profitability" element={<ProfitabilityReportPage />} />
              <Route path="/accounting/budget" element={<BudgetPage />} />
              <Route path="/accounting/assets" element={<DepreciationPage />} />
              <Route path="/accounting/reports/indicators" element={<FinancialIndicatorsPage />} />
              <Route path="/accounting/tax-config" element={<TaxConfigPage />} />
              <Route path="/accounting/inventory-adjustments" element={<InventoryAdjustmentPage />} />
              <Route path="/accounting/exogena" element={<ExogenaPage />} />
              <Route path="/manual-contabilidad" element={<ManualContablePage />} />
              <Route path="/user-manual" element={<UserManualPage />} />
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
