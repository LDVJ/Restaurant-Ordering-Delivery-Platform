import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ROLES, ROLE_HOME_PATHS } from './utils/constants';

import ProtectedRoute from './components/common/ProtectedRoute';
import PublicOnlyRoute from './components/common/PublicOnlyRoute';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RestaurantsPage from './pages/customer/RestaurantsPage';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import DeliveryDashboardPage from './pages/delivery/DeliveryDashboardPage';
import UiDemoPage from './pages/UiDemoPage';

/**
 * Root Redirect Handler
 * If user is authenticated, redirects to role home; else to /login
 */
function RootRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    const destination = ROLE_HOME_PATHS[user.role] || '/login';
    return <Navigate to={destination} replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfirmProvider>
          {/* Global Toast Provider */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#FFFFFF',
                color: '#1C1C1C',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                fontWeight: 500,
              },
              success: {
                iconTheme: {
                  primary: '#16A34A',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#DC2626',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />

          <div className="min-h-screen bg-page text-text-main font-sans">
            <Routes>
              {/* Root redirect based on auth status */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public-only routes: Login & Register */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />

              {/* Protected Authenticated Routes inside AppLayout */}
              <Route element={<AppLayout />}>
                {/* Customer Home */}
                <Route
                  path="/restaurants"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                      <RestaurantsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Owner Home */}
                <Route
                  path="/owner"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.RESTAURANT_OWNER]}>
                      <OwnerDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Delivery Partner Home */}
                <Route
                  path="/delivery"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.DELIVERY_PARTNER]}>
                      <DeliveryDashboardPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Preserved UI Demo Route for testing components and dialogs */}
              <Route path="/ui-demo" element={<UiDemoPage />} />

              {/* Fallback */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </div>
        </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
