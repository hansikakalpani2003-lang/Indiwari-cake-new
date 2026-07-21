/**
 * AuthContext.jsx
 * Global auth state using React Context API.
 *
 * Provides:
 *   - user       : decoded user object { id, name, email, role, phone, delivery_address }
 *   - token      : raw JWT string
 *   - loading    : true while checking sessionStorage on mount
 *   - login()    : async (email, password) => void
 *   - logout()   : void
 *   - register() : async (formData) => void
 *
 * Usage:
 *   const { user, login, logout } = useAuth();
 *
 * Token storage:
 *   Stored in sessionStorage (persists across page refreshes in the same tab,
 *   but NOT across new browser windows — acceptable for this project).
 */

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Provider component — wraps the whole app in App.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true on first load

  // On mount: restore session from sessionStorage if it exists
  useEffect(() => {
    const storedToken = sessionStorage.getItem('indiwari_token');
    const storedUser = sessionStorage.getItem('indiwari_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted data — clear it
        sessionStorage.removeItem('indiwari_token');
        sessionStorage.removeItem('indiwari_user');
      }
    }

    setLoading(false);
  }, []);

  /**
   * Saves auth data to state and sessionStorage.
   * @param {string} newToken
   * @param {object} newUser
   */
  const persistSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    sessionStorage.setItem('indiwari_token', newToken);
    sessionStorage.setItem('indiwari_user', JSON.stringify(newUser));
  };

  /**
   * login()
   * Authenticates the user via POST /api/auth/login.
   * Stores the token and user in state + sessionStorage.
   * @throws error from Axios if the request fails (e.g. 401)
   */
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persistSession(data.token, data.user);
    return data.user; // return user so caller knows the role for redirect
  };

  /**
   * register()
   * Creates a new customer account via POST /api/auth/register.
   * On success, logs the user in automatically.
   * @param {{ name, email, password, confirmPassword, phone?, address? }} formData
   * @throws error from Axios if the request fails (e.g. 409, 422)
   */
  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    persistSession(data.token, data.user);
    return data.user;
  };

  /**
   * logout()
   * Clears auth state and sessionStorage, then redirects to Home.
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('indiwari_token');
    sessionStorage.removeItem('indiwari_user');
    window.location.href = '/';
  };

  const contextValue = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>. Wrap your app in AuthProvider.');
  }
  return context;
};

export default AuthContext;