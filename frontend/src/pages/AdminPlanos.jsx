import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { API_BASE_URL } from '../config/api.js';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowLeft,
  CreditCard,
  Users,
  DollarSign,
  Calendar,
  Check,
  X
} from 'lucide-react';

const AdminPlanos = () => {
  const { admin } = useAdminAuth();
  const navigate = useNavigate();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlano, setEditingPlano] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo_plano: 'BASICO',
    categoria: 'PROFISSIONAL',
    valor: '',
    periodo: 'MENSAL',
    recursos: [],
    limite_consultas: '',
    limite_profissionais: '',
    ativo: true
  });

  const [newRecurso, setNewRecurso] = useState('');

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const response = await fetch('${API_BASE_URL}/admin/planos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlanos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingPlano 
        ? `${API_BASE_URL}/admin/planos/${editingPlano.id}`
        : '${API_BASE_URL}/admin/planos';
      
      const method = editingPlano ? 'PUT' : 'POST';

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
        setEditingPlano(null);
        resetForm();
        fetchPlanos();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar plano' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plano) => {
    setEditingPlano(plano);
    setFormData({
      nome: plano.nome,
      descricao: plano.descricao,
      tipo_plano: plano.tipo_plano,
      categoria: plano.categoria,
      valor: plano.valor.toString(),
      periodo: plano.periodo,
      recursos: plano.recursos,
      limite_consultas: plano.limite_consultas?.toString() || '',
      limite_profissionais: plano.limite_profissionais?.toString() || '',
      ativo: plano.ativo
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este plano?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/planos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Plano deletado com sucesso' });
        fetchPlanos();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao deletar plano' });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/planos/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Status alterado com sucesso' });
        fetchPlanos();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar status' });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo_plano: 'BASICO',
      categoria: 'PROFISSIONAL',
      valor: '',
      periodo: 'MENSAL',
      recursos: [],
      limite_consultas: '',
      limite_profissionais: '',
      ativo: true
    });
    setNewRecurso('');
  };

  const addRecurso = () => {
    if (newRecurso.trim()) {
      setFormData(prev => ({
        ...prev,
        recursos: [...prev.recursos, newRecurso.trim()]
      }));
      setNewRecurso('');
    }
  };

  const removeRecurso = (index) => {
    setFormData(prev => ({
      ...prev,
      recursos: prev.recursos.filter((_, i) => i !== index)
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading && planos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando planos...</p>
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
              <h1 className="text-xl font-semibold text-gray-900">
                Gerenciar Planos
              </h1>
            </div>
            
            <Button
              onClick={() => {
                setShowForm(true);
                setEditingPlano(null);
                resetForm();
              }}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Plano</span>
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

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingPlano ? 'Editar Plano' : 'Criar Novo Plano'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Plano</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({...formData, valor: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_plano">Tipo</Label>
                    <select
                      id="tipo_plano"
                      value={formData.tipo_plano}
                      onChange={(e) => setFormData({...formData, tipo_plano: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="BASICO">Básico</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <select
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="PROFISSIONAL">Profissional</option>
                      <option value="CLIENTE">Cliente</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="periodo">Período</Label>
                    <select
                      id="periodo"
                      value={formData.periodo}
                      onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="MENSAL">Mensal</option>
                      <option value="TRIMESTRAL">Trimestral</option>
                      <option value="SEMESTRAL">Semestral</option>
                      <option value="ANUAL">Anual</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="limite_consultas">Limite de Consultas</Label>
                    <Input
                      id="limite_consultas"
                      type="number"
                      value={formData.limite_consultas}
                      onChange={(e) => setFormData({...formData, limite_consultas: e.target.value})}
                      placeholder="Deixe vazio para ilimitado"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="w-full p-2 border rounded-md h-20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recursos Incluídos</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newRecurso}
                      onChange={(e) => setNewRecurso(e.target.value)}
                      placeholder="Adicionar recurso"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecurso())}
                    />
                    <Button type="button" onClick={addRecurso}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.recursos.map((recurso, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{recurso}</span>
                        <button
                          type="button"
                          onClick={() => removeRecurso(index)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  />
                  <Label htmlFor="ativo">Plano Ativo</Label>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : (editingPlano ? 'Atualizar' : 'Criar')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPlano(null);
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

        {/* Planos List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planos.map((plano) => (
            <Card key={plano.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>{plano.nome}</span>
                    </CardTitle>
                    <CardDescription>{plano.descricao}</CardDescription>
                  </div>
                  <Badge variant={plano.ativo ? "default" : "secondary"}>
                    {plano.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(plano.valor)}
                  </span>
                  <span className="text-sm text-gray-500">
                    /{plano.periodo.toLowerCase()}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{plano.categoria}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{plano.tipo_plano}</span>
                  </div>
                </div>

                {plano.recursos.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Recursos:</h4>
                    <div className="flex flex-wrap gap-1">
                      {plano.recursos.slice(0, 3).map((recurso, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {recurso}
                        </Badge>
                      ))}
                      {plano.recursos.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{plano.recursos.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(plano)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(plano.id)}
                    >
                      {plano.ativo ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(plano.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {plano._count.assinaturas + plano._count.assinaturas_cliente} assinaturas
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {planos.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum plano criado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando seu primeiro plano de assinatura
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Plano
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminPlanos;
