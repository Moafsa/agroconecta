import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const AdminLayout = ({ children }) => {
  const { admin, logout } = useAdminAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/admin/dashboard" className="text-xl font-bold text-gray-800">
            Agro-Conecta Admin
          </Link>
          {admin && (
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Olá, {admin.nome}</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Sair
              </button>
            </div>
          )}
        </nav>
      </header>
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
