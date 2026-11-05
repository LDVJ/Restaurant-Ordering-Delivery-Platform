import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME_PATHS } from '../../utils/constants';

/**
 * PublicOnlyRoute Component
 * Restricts access for already logged in users (e.g. login & register pages).
 * Sourced from Section 7 of Frontend Guide.
 */
export default function PublicOnlyRoute({ children }) {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    const userHome = ROLE_HOME_PATHS[user.role] || '/';
    return <Navigate to={userHome} replace />;
  }

  return children ? children : <Outlet />;
}
