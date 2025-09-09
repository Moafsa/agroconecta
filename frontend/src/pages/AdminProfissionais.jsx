import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { API_BASE_URL } from '../config/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowLeft,
  Users,
  Search,
  Filter,
  MapPin,
  Star,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  Award
} from 'lucide-react';

const AdminProfissionais = () => {
  const { admin } = useAdminAuth();
  const navigate = useNavigate();
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEspecialidade, setFilterEspecialidade] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [showFaturas, setShowFaturas] = useState(null);
  const [faturas, setFaturas] = useState([]);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    contato: '',
    regiao_atuacao: '',
    status_assinatura: 'ATIVO',
    comissao_plataforma: ''
  });

  useEffect(() => {
    fetchProfissionais();
  }, [pagination.page, searchTerm, filterEspecialidade]);

  const fetchProfissionais = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterEspecialidade) params.append('especialidade', filterEspecialidade);

      const response = await fetch(`${API_BASE_URL}/admin/profissionais?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfissionais(data.profissionais);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingProfissional 
        ? `${API_BASE_URL}/admin/profissionais/${editingProfissional.id}`
        : `${API_BASE_URL}/admin/profissionais`;
      
      const method = editingProfissional ? 'PUT' : 'POST';

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
        setEditingProfissional(null);
        resetForm();
        fetchProfissionais();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar profissional' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (profissional) => {
    setEditingProfissional(profissional);
    setFormData({
      nome: profissional.nome,
      email: profissional.email || '',
      contato: profissional.contato,
      regiao_atuacao: profissional.regiao_atuacao || '',
      status_assinatura: profissional.status_assinatura || 'ATIVO',
      comissao_plataforma: profissional.comissao_plataforma || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este profissional?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/profissionais/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profissional deletado com sucesso' });
        fetchProfissionais();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao deletar profissional' });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      contato: '',
      regiao_atuacao: '',
      status_assinatura: 'ATIVO',
      comissao_plataforma: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'ATIVO': 'bg-green-100 text-green-800',
      'INATIVO': 'bg-red-100 text-red-800',
      'PENDENTE': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const fetchFaturas = async (profissionalId) => {
    try {
      console.log('🔍 Buscando faturas para profissional:', profissionalId);
      const response = await fetch(`${API_BASE_URL}/admin/profissionais/${profissionalId}/faturas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      console.log('📡 Resposta da API:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Faturas recebidas:', data);
        setFaturas(data.faturas);
        setShowFaturas(profissionalId);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro na API:', errorData);
        setMessage({ type: 'error', text: `Erro ao buscar faturas: ${errorData.message || 'Erro desconhecido'}` });
      }
    } catch (error) {
      console.error('❌ Erro ao buscar faturas:', error);
      setMessage({ type: 'error', text: `Erro ao buscar faturas: ${error.message}` });
    }
  };

  const confirmarPagamento = async (profissionalId, assinaturaId, pagamentoId) => {
    if (!confirm('Tem certeza que deseja confirmar este pagamento? Isso ativará a assinatura do profissional.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/profissionais/${profissionalId}/confirmar-pagamento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          assinatura_id: assinaturaId,
          pagamento_id: pagamentoId
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Pagamento confirmado e assinatura ativada com sucesso!' });
        fetchFaturas(profissionalId); // Recarregar faturas
        fetchProfissionais(); // Recarregar lista de profissionais
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      setMessage({ type: 'error', text: 'Erro ao confirmar pagamento' });
    }
  };

  if (loading && profissionais.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando profissionais...</p>
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
                Gerenciar Profissionais
              </h1>
            </div>
            
            <Button
              onClick={() => {
                setShowForm(true);
                setEditingProfissional(null);
                resetForm();
              }}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Profissional</span>
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
                    placeholder="Buscar por nome, email, contato ou região..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Input
                  placeholder="Filtrar por especialidade..."
                  value={filterEspecialidade}
                  onChange={(e) => setFilterEspecialidade(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingProfissional ? 'Editar Profissional' : 'Criar Novo Profissional'}
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regiao_atuacao">Região de Atuação</Label>
                    <Input
                      id="regiao_atuacao"
                      value={formData.regiao_atuacao}
                      onChange={(e) => setFormData({...formData, regiao_atuacao: e.target.value})}
                      placeholder="Ex: Caxias do Sul, RS"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comissao_plataforma">Comissão da Plataforma (%)</Label>
                    <Input
                      id="comissao_plataforma"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.comissao_plataforma}
                      onChange={(e) => setFormData({...formData, comissao_plataforma: e.target.value})}
                      placeholder="Ex: 15.5"
                    />
                    <p className="text-xs text-gray-500">
                      Percentual de comissão que a plataforma recebe (0-100%)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status_assinatura">Status da Assinatura</Label>
                    <select
                      id="status_assinatura"
                      value={formData.status_assinatura}
                      onChange={(e) => setFormData({...formData, status_assinatura: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="ATIVO">Ativo</option>
                      <option value="INATIVO">Inativo</option>
                      <option value="PENDENTE">Pendente</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : (editingProfissional ? 'Atualizar' : 'Criar')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProfissional(null);
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

        {/* Profissionais List */}
        <div className="space-y-4">
          {profissionais.map((profissional) => (
            <Card key={profissional.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{profissional.nome}</h3>
                      <Badge className={getStatusColor(profissional.status_assinatura)}>
                        {profissional.status_assinatura}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{profissional.contato}</span>
                      </div>
                      
                      {profissional.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{profissional.email}</span>
                        </div>
                      )}
                      
                      {profissional.regiao_atuacao && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{profissional.regiao_atuacao}</span>
                        </div>
                      )}
                      
                      {profissional.comissao_plataforma !== null && profissional.comissao_plataforma !== undefined && (
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4" />
                          <span>Comissão: {profissional.comissao_plataforma}%</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Cadastrado em {new Date(profissional.data_cadastro).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{profissional._count.interacoes + profissional._count.interacoes_cliente} interações</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{profissional._count.avaliacoes} avaliações</span>
                      </div>
                    </div>

                    {/* Especialidades */}
                    {profissional.especialidades.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-2">Especialidades:</h4>
                        <div className="flex flex-wrap gap-2">
                          {profissional.especialidades.map((esp) => (
                            <Badge key={esp.especialidade.id} variant="secondary" className="text-xs">
                              {esp.especialidade.nome}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status da Assinatura - Simplificado */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">Status da Assinatura:</span>
                          <Badge className={`ml-2 ${getStatusColor(profissional.status_assinatura)}`}>
                            {profissional.status_assinatura}
                          </Badge>
                        </div>
                        
                        {profissional.status_assinatura === 'PENDENTE' && (
                          <Button
                            size="sm"
                            onClick={() => fetchFaturas(profissional.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Confirmar Pagamento
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(profissional)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(profissional.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Seção de Faturas - Simplificada */}
        {showFaturas && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Confirmar Pagamento</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFaturas(null)}
                >
                  Fechar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {faturas.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma fatura pendente encontrada.
                </p>
              ) : (
                <div className="space-y-4">
                  {faturas.filter(f => f.status === 'PENDENTE').map((fatura) => (
                    <div key={fatura.id} className="border rounded-lg p-4 bg-yellow-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-lg">
                            R$ {parseFloat(fatura.valor).toFixed(2)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Vencimento: {new Date(fatura.data_vencimento).toLocaleDateString('pt-BR')}
                          </p>
                          {fatura.assinatura && (
                            <p className="text-sm text-gray-600">
                              Plano: {fatura.assinatura.plano.nome}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => confirmarPagamento(showFaturas, fatura.assinatura.id, fatura.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            ✅ Confirmar Pagamento
                          </Button>
                          
                          {fatura.invoice_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(fatura.invoice_url, '_blank')}
                            >
                              Ver Fatura
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {faturas.filter(f => f.status === 'PENDENTE').length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Nenhuma fatura pendente para confirmar.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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

        {profissionais.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum profissional encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterEspecialidade 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro profissional'
                }
              </p>
              {!searchTerm && !filterEspecialidade && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Profissional
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminProfissionais;
