import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './Utils/ToastContext';
import ToastDisplay from './Components/Common/ToastProvider';
import Login from './Pages/Login';
import Register from './Pages/Register';
import DashboardLayout from './Components/Layout/DashboardLayout';
import DashboardHome from './Pages/Dashboard/DashboardHome';
import UsersPage from './Pages/Dashboard/UsersPage';
import RolesPage from './Pages/Dashboard/RolesPage';
import CustomersPage from './Pages/Dashboard/CustomersPage';
import ManageMeasurementPage from './Pages/Dashboard/ManageMeasurementPage';
import ReportsPage from './Pages/Dashboard/ReportsPage';
import FinancialsPage from './Pages/Dashboard/FinancialsPage';
import OrdersPage from './Pages/Dashboard/OrdersPage';
import BookOrderPage from './Pages/Dashboard/BookOrderPage';
import OrderDetailsPage from './Pages/Dashboard/OrderDetailsPage';
import ProductItemsPage from './Pages/Dashboard/ProductItemsPage';
import ProductsPage from './Pages/Dashboard/ProductsPage';
import ProductVariantsPage from './Pages/Dashboard/ProductVariantsPage';
import CreateProductVariantPage from './Pages/Dashboard/CreateProductVariantPage';
import EditProductVariantPage from './Pages/Dashboard/EditProductVariantPage';
import { isAuthenticated, isAdmin } from './Services/ApiServices';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin Only Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return isAdmin() ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
            <Route path="roles" element={<AdminRoute><RolesPage /></AdminRoute>} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="measurements/manage/:customerId" element={<ManageMeasurementPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="financials" element={<FinancialsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/book" element={<BookOrderPage />} />
            <Route path="orders/:id" element={<OrderDetailsPage />} />
            <Route path="product-items" element={<ProductItemsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="product-variants" element={<ProductVariantsPage />} />
            <Route path="product-variants/create" element={<CreateProductVariantPage />} />
            <Route path="product-variants/edit/:id" element={<EditProductVariantPage />} />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastDisplay />
      </Router>
    </ToastProvider>
  );
}

export default App;
