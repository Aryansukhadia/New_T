import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ToastProvider } from './Utils/ToastContext';
import ToastDisplay from './Components/Common/ToastProvider';
import Login from './Pages/Login';
import DashboardLayout from './Components/Layout/DashboardLayout';
import { isAuthenticated } from './Services/ApiServices';
import { getAllRoutes } from './Config/roleRoutes';
import { RoleBasedRoute } from './Components/Common/RoleBasedRoute';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Render all routes - access controlled by RoleBasedRoute */}
              {getAllRoutes().map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <RoleBasedRoute
                      allowedRoles={route.allowedRoles}
                      requireAuth={route.requireAuth}
                    >
                      {route.component()}
                    </RoleBasedRoute>
                  }
                />
              ))}
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ToastDisplay />
        </Router>
      </ToastProvider>
    </Provider>
  );
}

export default App;
