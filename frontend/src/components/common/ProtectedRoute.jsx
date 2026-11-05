import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME_PATHS } from '../../utils/constants';

/**
 * ProtectedRoute Component
 * Restricts access to authenticated users with specified allowedRoles.
 * Sourced from Section 7 of Frontend Guide.
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect to login and save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const userHome = ROLE_HOME_PATHS[user.role] || '/login';
    return <Navigate to={userHome} replace />;
  }

  return children ? children : <Outlet />;
}
