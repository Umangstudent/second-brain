import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sb_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('sb_token');
      if (storedToken) {
        try {
          // Simple JWT decode to get user data if API doesn't have a /me endpoint
          // In a real app, you might want to call an API to verify the token and get full user details
          const payloadBase64 = storedToken.split('.')[1];
          if (payloadBase64) {
            const decodedPayload = JSON.parse(atob(payloadBase64));
            setUser({ id: decodedPayload.userId || decodedPayload.id, username: decodedPayload.username || 'User' });
          } else {
             setUser({ username: 'User' });
          }
          setToken(storedToken);
        } catch (error) {
          console.error("Token decoding failed:", error);
          localStorage.removeItem('sb_token');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('sb_token', newToken);
      setToken(newToken);
      setUser(userData || { username: email.split('@')[0] });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('sb_token', newToken);
      setToken(newToken);
      setUser(userData || { username });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('sb_token');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
