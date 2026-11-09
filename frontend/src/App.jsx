import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { CartProvider } from './context/CartContext';
import { ROLES, ROLE_HOME_PATHS } from './utils/constants';

import ProtectedRoute from './components/common/ProtectedRoute';
import PublicOnlyRoute from './components/common/PublicOnlyRoute';
import AppLayout from './components/layout/AppLayout';
import OwnerLayout from './components/layout/OwnerLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RestaurantsPage from './pages/customer/RestaurantsPage';
import RestaurantMenuPage from './pages/customer/RestaurantMenuPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import AiInsightsPage from './pages/customer/AiInsightsPage';
import ProfilePage from './pages/common/ProfilePage';
import OwnerSetupPage from './pages/owner/OwnerSetupPage';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerMenuPage from './pages/owner/OwnerMenuPage';
import OwnerOrdersPage from './pages/owner/OwnerOrdersPage';
import OwnerReturnsPage from './pages/owner/OwnerReturnsPage';
import OwnerRestaurantPage from './pages/owner/OwnerRestaurantPage';
import DeliveryDashboardPage from './pages/delivery/DeliveryDashboardPage';
import UiDemoPage from './pages/UiDemoPage';

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
          <CartProvider>
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
                success: { iconTheme: { primary: '#16A34A', secondary: '#FFFFFF' } },
                error: { iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' } },
              }}
            />

            <div className="min-h-screen bg-page text-text-main font-sans">
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

                {/* Protected Authenticated Routes */}
                <Route element={<AppLayout />}>
                  {/* Shared Profile for All Logged-in Roles */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={[ROLES.CUSTOMER, ROLES.RESTAURANT_OWNER, ROLES.DELIVERY_PARTNER]}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Customer Routes */}
                  <Route path="/restaurants" element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}><RestaurantsPage /></ProtectedRoute>} />
                  <Route path="/restaurants/:id" element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}><RestaurantMenuPage /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}><CartPage /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}><CheckoutPage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}><CustomerDashboardPage /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}><OrderDetailPage /></ProtectedRoute>} />
                  <Route path="/ai-insights" element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}><AiInsightsPage /></ProtectedRoute>} />

                  {/* Owner Setup (standalone, guarded for owners with no restaurant) */}
                  <Route path="/owner/setup" element={<ProtectedRoute allowedRoles={[ROLES.RESTAURANT_OWNER]}><OwnerSetupPage /></ProtectedRoute>} />

                  {/* Owner Portal Layout & Nested Tabs */}
                  <Route element={<ProtectedRoute allowedRoles={[ROLES.RESTAURANT_OWNER]}><OwnerLayout /></ProtectedRoute>}>
                    <Route path="/owner" element={<OwnerDashboardPage />} />
                    <Route path="/owner/menu" element={<OwnerMenuPage />} />
                    <Route path="/owner/orders" element={<OwnerOrdersPage />} />
                    <Route path="/owner/returns" element={<OwnerReturnsPage />} />
                    <Route path="/owner/restaurant" element={<OwnerRestaurantPage />} />
                  </Route>

                  {/* Delivery Partner Routes */}
                  <Route path="/delivery" element={<ProtectedRoute allowedRoles={[ROLES.DELIVERY_PARTNER]}><DeliveryDashboardPage /></ProtectedRoute>} />
                </Route>

                <Route path="/ui-demo" element={<UiDemoPage />} />
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </div>
          </CartProvider>
        </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
