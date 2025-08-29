import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Plus,
  DollarSign,
  Calendar,
  UserCheck,
  Building
} from 'lucide-react';

const AdminDashboard = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPlanos: 0,
    planosAtivos: 0,
    totalClientes: 0,
    clientesAtivos: 0,
    totalProfissionais: 0,
    profissionaisAtivos: 0,
    receitaTotal: 0,
    receitaClientes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [planosStats, clientesStats, profissionaisStats] = await Promise.all([
        fetch('http://localhost:5001/api/admin/planos/stats/overview', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }).then(res => res.json()),
        fetch('http://localhost:5001/api/admin/clientes/stats/overview', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }).then(res => res.json()),
        fetch('http://localhost:5001/api/admin/profissionais/stats/overview', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }).then(res => res.json()).catch(() => ({ totalProfissionais: 0, profissionaisAtivos: 0 }))
      ]);

      setStats({
        ...planosStats,
        ...clientesStats,
        ...profissionaisStats
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Painel Administrativo
              </h1>
              <Badge variant="secondary" className="ml-3">
                {admin?.nivel_acesso}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {admin?.nome}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlanos}</div>
              <p className="text-xs text-muted-foreground">
                {stats.planosAtivos} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClientes}</div>
              <p className="text-xs text-muted-foreground">
                {stats.clientesAtivos} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Profissionais</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProfissionais}</div>
              <p className="text-xs text-muted-foreground">
                {stats.profissionaisAtivos} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.receitaTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                Assinaturas ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Clientes</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.receitaClientes)}
              </div>
              <p className="text-xs text-muted-foreground">
                Planos de clientes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate('/admin/planos')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Gerenciar Planos</span>
              </CardTitle>
              <CardDescription>
                Criar, editar e gerenciar planos de assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Plano
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/admin/clientes')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Gerenciar Clientes</span>
              </CardTitle>
              <CardDescription>
                Visualizar e gerenciar clientes cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <UserCheck className="h-4 w-4 mr-2" />
                Ver Clientes
              </Button>
            </CardContent>
          </Card>

                     <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => navigate('/admin/profissionais')}>
             <CardHeader>
               <CardTitle className="flex items-center space-x-2">
                 <UserCheck className="h-5 w-5" />
                 <span>Gerenciar Profissionais</span>
               </CardTitle>
               <CardDescription>
                 Visualizar e gerenciar profissionais cadastrados
               </CardDescription>
             </CardHeader>
             <CardContent>
               <Button className="w-full">
                 <Users className="h-4 w-4 mr-2" />
                 Ver Profissionais
               </Button>
             </CardContent>
           </Card>

           <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => navigate('/admin/profile')}>
             <CardHeader>
               <CardTitle className="flex items-center space-x-2">
                 <Settings className="h-5 w-5" />
                 <span>Meu Perfil</span>
               </CardTitle>
               <CardDescription>
                 Configurar perfil e chave PIX
               </CardDescription>
             </CardHeader>
             <CardContent>
               <Button className="w-full">
                 <Settings className="h-4 w-4 mr-2" />
                 Configurar Perfil
               </Button>
             </CardContent>
           </Card>

           <Card className="hover:shadow-lg transition-shadow cursor-pointer">
             <CardHeader>
               <CardTitle className="flex items-center space-x-2">
                 <TrendingUp className="h-5 w-5" />
                 <span>Relatórios</span>
               </CardTitle>
               <CardDescription>
                 Visualizar relatórios e análises
               </CardDescription>
             </CardHeader>
             <CardContent>
               <Button className="w-full" variant="outline">
                 <Calendar className="h-4 w-4 mr-2" />
                 Ver Relatórios
               </Button>
             </CardContent>
           </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Admin criado com sucesso</p>
                  <p className="text-xs text-gray-500">Há 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Sistema de planos implementado</p>
                  <p className="text-xs text-gray-500">Há 1 dia</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
