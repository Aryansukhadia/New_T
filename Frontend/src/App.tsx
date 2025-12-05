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
import { AuthProvider } from './Context/AuthContext';
// import { Box, CircularProgress } from '@mui/material';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

// Loading component
// const LoadingScreen = () => (
//   <Box
//     sx={{
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//     }}
//   >
//     <CircularProgress size={60} sx={{ color: 'white' }} />
//   </Box>
// );

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <Router>
          <AuthProvider>
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
          </AuthProvider>
        </Router>
      </ToastProvider>
    </Provider>
  );
}

export default App;
