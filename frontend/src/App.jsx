import React from 'react';
import { Routes, Route, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';

// Layouts
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout'; // Importar AdminLayout

// Páginas Principais
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PaymentSuccess from './pages/PaymentSuccess';
import TestePagamento from './pages/TestePagamento';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Verificacao from './pages/Verificacao';
import Faturas from './pages/Faturas';

// Páginas Admin
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPlanos from './pages/AdminPlanos';
import AdminClientes from './pages/AdminClientes';
import AdminProfissionais from './pages/AdminProfissionais';
import AdminVerificacao from './pages/AdminVerificacao';
import AdminProfile from './pages/AdminProfile';
import AdminClienteDetalhes from './pages/AdminClienteDetalhes';
import AdminClienteEditar from './pages/AdminClienteEditar';

import './App.css';

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Componente para rotas protegidas do admin
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading) return <div>Carregando...</div>;
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

// Estrutura de rotas principal
const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas e do Profissional (com MainLayout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/teste-pagamento" element={<TestePagamento />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
        <Route path="/verificacao" element={<ProtectedRoute><Verificacao /></ProtectedRoute>} />
        <Route path="/faturas" element={<ProtectedRoute><Faturas /></ProtectedRoute>} />
      </Route>

      {/* Rotas do Painel Administrativo (com AdminLayout) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/*"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="planos" element={<AdminPlanos />} />
                <Route path="clientes" element={<AdminClientes />} />
                <Route path="clientes/:id" element={<AdminClienteDetalhes />} />
                <Route path="clientes/:id/editar" element={<AdminClienteEditar />} />
                <Route path="profissionais" element={<AdminProfissionais />} />
                <Route path="verificacao" element={<AdminVerificacao />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      
      {/* Rota de fallback final */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};


// Componente App com Providers
function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <AppRoutes />
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

