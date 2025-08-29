import React, { useEffect } from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'user_status_updated') {
        console.log('User status updated event received. Refreshing user...');
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Limpa o listener quando o componente é desmontado
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshUser]);


  return (
    <div>
      <Header />
      <Outlet /> 
    </div>
  );
};

export default MainLayout;
