import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api'; // Assuming jsconfig.json paths are set up

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token'); // Simplified key name
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await authAPI.login({ email, senha });
      if (response.token && response.user) {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response.user; // Return user on success
      }
    } catch (error) {
      console.error("Login failed:", error);
      // Clean up on failure to prevent inconsistent state
      logout(); 
      throw error; // Re-throw error to be caught by the calling component
    }
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await authAPI.getMe();
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // Opcional: Deslogar se o refresh falhar (ex: token inválido)
      // logout(); 
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    refreshUser // Exportar a nova função
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

