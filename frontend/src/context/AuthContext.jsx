import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('billflow_user');
    const token = localStorage.getItem('billflow_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data; // { token, user }
  };

  const completeLogin = (token, userData) => {
    localStorage.setItem('billflow_token', token);
    localStorage.setItem('billflow_user', JSON.stringify(userData));
    setUser(userData);
  };

  const switchProfile = async (token, employeeId, password) => {
    // We use the provided token if we haven't set the global one yet
    const response = await api.post('/switch-profile', 
      { employeeId, password },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data; // { token, user }
  };

  const logout = () => {
    localStorage.removeItem('billflow_token');
    localStorage.removeItem('billflow_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, completeLogin, switchProfile, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
