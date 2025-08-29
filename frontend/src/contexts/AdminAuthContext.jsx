import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth deve ser usado dentro de um AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Adicionar um efeito para atualizar os dados do admin periodicamente ou ao montar
  useEffect(() => {
    if (token) {
      const refreshAdminData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:5001/api/admin/auth/me?cacheBust=${Date.now()}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setAdmin(data.admin);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Erro ao atualizar dados do admin:', error);
          logout();
        } finally {
          setLoading(false);
        }
      };
      refreshAdminData();
    }
  }, []); // Executa apenas uma vez ao montar o componente

  const verifyToken = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/auth/me?cacheBust=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (response.ok) {
        setAdmin(data.admin);
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5001/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Erro ao fazer logout no backend:', error);
    } finally {
      setAdmin(null);
      setToken(null);
      localStorage.removeItem('adminToken');
    }
  };

  const updateAdmin = (updatedAdmin) => {
    setAdmin(updatedAdmin);
  };

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    updateAdmin,
    isAuthenticated: !!admin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
