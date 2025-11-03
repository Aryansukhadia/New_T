import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import DashboardLayout from './Components/Layout/DashboardLayout';
import DashboardHome from './Pages/Dashboard/DashboardHome';
import UsersPage from './Pages/Dashboard/UsersPage';
import RolesPage from './Pages/Dashboard/RolesPage';
import CustomersPage from './Pages/Dashboard/CustomersPage';
import MeasurementsPage from './Pages/Dashboard/MeasurementsPage';
import ReportsPage from './Pages/Dashboard/ReportsPage';
import FinancialsPage from './Pages/Dashboard/FinancialsPage';
import OrdersPage from './Pages/Dashboard/OrdersPage';
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
          <Route path="measurements" element={<MeasurementsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="financials" element={<FinancialsPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
