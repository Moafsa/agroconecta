import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowLeft,
  Users,
  Search,
  Filter,
  Building,
  UserCheck,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { adminAPI } from '../lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

const AdminClientes = () => {
  const { admin } = useAdminAuth();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    contato: '',
    tipo_cliente: 'PRODUTOR',
    regiao: ''
  });

  useEffect(() => {
    fetchClientes();
  }, [pagination.page, searchTerm, filterTipo]);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        tipo: filterTipo,
      };
      // Usar a função centralizada da API
      const data = await adminAPI.getClientes(params);
      setClientes(data.clientes);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Não foi possível carregar os clientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingCliente 
        ? `http://localhost:5001/api/admin/clientes/${editingCliente.id}`
        : 'http://localhost:5001/api/admin/clientes';
      
      const method = editingCliente ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setShowForm(false);
        setEditingCliente(null);
        resetForm();
        fetchClientes();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar cliente' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      email: cliente.email || '',
      contato: cliente.contato,
      tipo_cliente: cliente.tipo_cliente,
      regiao: cliente.regiao || ''
    });
    setShowForm(true);
  };

  const handleDeleteCliente = async (clienteId) => {
    try {
      await adminAPI.deleteCliente(clienteId);
      toast.success('Cliente excluído com sucesso!');
      // Atualiza a lista removendo o cliente excluído
      setClientes((prevClientes) =>
        prevClientes.filter((cliente) => cliente.id !== clienteId)
      );
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error(error.message || 'Falha ao excluir o cliente.');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      contato: '',
      tipo_cliente: 'PRODUTOR',
      regiao: ''
    });
  };

  const getTipoClienteLabel = (tipo) => {
    const labels = {
      'PRODUTOR': 'Produtor',
      'EMPRESA': 'Empresa',
      'COOPERATIVA': 'Cooperativa',
      'CONSULTOR': 'Consultor'
    };
    return labels[tipo] || tipo;
  };

  const getTipoClienteColor = (tipo) => {
    const colors = {
      'PRODUTOR': 'bg-green-100 text-green-800',
      'EMPRESA': 'bg-blue-100 text-blue-800',
      'COOPERATIVA': 'bg-purple-100 text-purple-800',
      'CONSULTOR': 'bg-orange-100 text-orange-800'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  if (loading && clientes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando clientes...</p>
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
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-2xl font-bold mb-4">Gerenciar Clientes</h1>
            </div>
            
            <Button
              onClick={() => {
                setShowForm(true);
                setEditingCliente(null);
                resetForm();
              }}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Cliente</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message.text && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, email ou contato..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Todos os tipos</option>
                  <option value="PRODUTOR">Produtor</option>
                  <option value="EMPRESA">Empresa</option>
                  <option value="COOPERATIVA">Cooperativa</option>
                  <option value="CONSULTOR">Consultor</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingCliente ? 'Editar Cliente' : 'Criar Novo Cliente'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contato">Contato</Label>
                    <Input
                      id="contato"
                      value={formData.contato}
                      onChange={(e) => setFormData({...formData, contato: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_cliente">Tipo de Cliente</Label>
                    <select
                      id="tipo_cliente"
                      value={formData.tipo_cliente}
                      onChange={(e) => setFormData({...formData, tipo_cliente: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="PRODUTOR">Produtor</option>
                      <option value="EMPRESA">Empresa</option>
                      <option value="COOPERATIVA">Cooperativa</option>
                      <option value="CONSULTOR">Consultor</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regiao">Região</Label>
                    <Input
                      id="regiao"
                      value={formData.regiao}
                      onChange={(e) => setFormData({...formData, regiao: e.target.value})}
                      placeholder="Ex: Caxias do Sul, RS"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : (editingCliente ? 'Atualizar' : 'Criar')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCliente(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Clientes Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status da Assinatura</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>
                    <Badge>{cliente.status_assinatura}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link to={`/admin/clientes/${cliente.id}`}>
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                    </Link>
                    <Link to={`/admin/clientes/${cliente.id}/editar`}>
                      <Button variant="secondary" size="sm">
                        Editar
                      </Button>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o
                            cliente e todos os seus dados associados (assinaturas, faturas, etc.).
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCliente(cliente.id)}
                          >
                            Confirmar Exclusão
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              
              <span className="flex items-center px-3 text-sm">
                Página {pagination.page} de {pagination.pages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}

        {clientes.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterTipo 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro cliente'
                }
              </p>
              {!searchTerm && !filterTipo && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminClientes;
