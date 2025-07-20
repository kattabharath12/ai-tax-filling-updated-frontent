import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set the base URL for axios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
axios.defaults.baseURL = API_URL;

console.log('API_URL configured as:', API_URL);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token found in localStorage:', token ? 'Yes' : 'No');
    console.log('Token value:', token);
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      console.log('Fetching user with token:', axios.defaults.headers.common['Authorization']);
      const response = await axios.get('/api/auth/me');
      console.log('User fetch successful:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('User fetch failed:', error);
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      console.log('Sending login request to:', `${API_URL}/api/auth/login`);
      
      const response = await axios.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Login response:', response.data);
      
      const { access_token } = response.data;
      
      if (!access_token) {
        throw new Error('No access token received');
      }

      console.log('Access token received:', access_token);
      
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      console.log('Token stored and header set. Fetching user...');
      await fetchUser();
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      console.log('Login error response:', error.response?.data);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration for:', userData.email);
      const response = await axios.post('/api/auth/register', userData);
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      console.log('Registration error response:', error.response?.data);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
