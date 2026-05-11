import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Computed authentication state
  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  /**
   * ATOMIC SESSION MANAGEMENT
   * Syncs state, storage, and API headers in one go.
   */
  const setSession = useCallback((accessToken, userData) => {
    if (accessToken && userData) {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  /**
   * INITIALIZE AUTH
   * Loads user on app start or browser refresh.
   */
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setSession(storedToken, parsedUser);
        } catch (err) {
          console.error("Auth Init Failed:", err);
          setSession(null, null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [setSession]);

  /**
   * AXIOS INTERCEPTOR
   * Automatically handles 401 Unauthorized errors (Expired sessions).
   */
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // If the server says unauthorized, we wipe the session locally
          setSession(null, null);
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [setSession]);

  /**
   * REFRESH USER DATA
   * Call this to update user balance, role, or status without re-logging.
   */
  const refreshUser = useCallback(async () => {
    try {
      const { data: response } = await api.get('/auth/me');
      const updatedUser = response.data;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Manual refresh failed:", error);
      return { success: false };
    }
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const { data: response } = await api.post('/auth/login', credentials);
      
      // Destructure based on your specific backend response structure
      const { user: userData, accessToken } = response.data;
      
      setSession(accessToken, userData);
      return { success: true, data: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const { data: response } = await api.post('/auth/register', userData);
      const { user: newUser, token: newToken } = response.data;
      
      setSession(newToken, newUser);
      return { success: true, data: newUser };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    setSession(null, null);
  }, [setSession]);

  /**
   * CONTEXT VALUE
   * Memoized to prevent unnecessary re-renders across the app.
   */
  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser
  }), [user, token, loading, isAuthenticated, logout, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
