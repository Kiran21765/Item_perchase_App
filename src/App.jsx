import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ItemTypesPage from './pages/ItemTypesPage.jsx';
import ItemsPage from './pages/ItemsPage.jsx';
import PurchaseFormPage from './pages/PurchaseFormPage.jsx';
import PurchasesPage from './pages/PurchasesPage.jsx';
import PurchaseDetailsPage from './pages/PurchaseDetailsPage.jsx';
import StockPage from './pages/StockPage.jsx';

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/item-types" element={<ItemTypesPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/purchases/new" element={<PurchaseFormPage />} />
        <Route path="/purchases/:ref/edit" element={<PurchaseFormPage />} />
        <Route path="/purchases/:ref" element={<PurchaseDetailsPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/stock" element={<StockPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
