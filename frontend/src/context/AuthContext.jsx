import { createContext, useContext, useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import * as authApi from '../api/authApi';

/**
 * AuthContext & AuthProvider
 * Sourced from Section 7 of Frontend Guide
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Lazy initial state reads localStorage synchronously on first render
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Login handler
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const { access_token, user: loggedInUser } = data;

      setToken(access_token);
      setUser(loggedInUser);

      localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedInUser));

      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);

    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CART);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
