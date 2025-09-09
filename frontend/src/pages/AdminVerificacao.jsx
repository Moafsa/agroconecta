import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  FileText,
  Award,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminVerificacao = () => {
  const { admin } = useAdminAuth();
  const navigate = useNavigate();
  const [profissionais, setProfissionais] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfissional, setSelectedProfissional] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar profissionais pendentes
      const profissionaisResponse = await fetch('/api/verificacao/pendentes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (profissionaisResponse.ok) {
        const profissionaisData = await profissionaisResponse.json();
        setProfissionais(profissionaisData.profissionais);
      }

      // Buscar estatísticas
      const statsResponse = await fetch('/api/verificacao/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarDocumento = async (documentoId, status, observacoes = '') => {
    try {
      const response = await fetch(`/api/verificacao/documentos/${documentoId}/verificar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status, observacoes })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Documento verificado com sucesso' });
        fetchData();
        if (selectedProfissional) {
          // Atualizar dados do profissional selecionado
          const updatedProfissional = profissionais.find(p => p.id === selectedProfissional.id);
          setSelectedProfissional(updatedProfissional);
        }
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao verificar documento' });
    }
  };

  const handleVerificarCertificacao = async (certificacaoId, status, observacoes = '') => {
    try {
      const response = await fetch(`/api/verificacao/certificacoes/${certificacaoId}/verificar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status, observacoes })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Certificação verificada com sucesso' });
        fetchData();
        if (selectedProfissional) {
          const updatedProfissional = profissionais.find(p => p.id === selectedProfissional.id);
          setSelectedProfissional(updatedProfissional);
        }
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao verificar certificação' });
    }
  };

  const handleAtualizarStatusProfissional = async (profissionalId, status, nivel = null) => {
    try {
      const response = await fetch(`/api/verificacao/profissionais/${profissionalId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ 
          status_verificacao: status,
          nivel_verificacao: nivel
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Status do profissional atualizado com sucesso' });
        fetchData();
        setShowDetails(false);
        setSelectedProfissional(null);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar status do profissional' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDENTE': 'bg-yellow-100 text-yellow-800',
      'EM_ANALISE': 'bg-blue-100 text-blue-800',
      'VERIFICADO': 'bg-green-100 text-green-800',
      'REJEITADO': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFICADO':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDENTE':
        return <Clock className="h-4 w-4" />;
      case 'REJEITADO':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredProfissionais = profissionais.filter(profissional =>
    profissional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profissional.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados de verificação...</p>
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
                Verificação de Contas
              </h1>
            </div>
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

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold">{stats.totalPendentes || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Verificados</p>
                  <p className="text-2xl font-bold">{stats.totalVerificados || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Documentos</p>
                  <p className="text-2xl font-bold">{stats.documentosPendentes || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Certificações</p>
                  <p className="text-2xl font-bold">{stats.certificacoesPendentes || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Profissionais */}
        <div className="space-y-4">
          {filteredProfissionais.map((profissional) => (
            <Card key={profissional.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{profissional.nome}</h3>
                      <Badge className={getStatusColor(profissional.status_verificacao)}>
                        {profissional.status_verificacao}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Email:</span>
                        <span>{profissional.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Contato:</span>
                        <span>{profissional.contato}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Região:</span>
                        <span>{profissional.regiao_atuacao}</span>
                      </div>
                    </div>

                    {/* Documentos e Certificações */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Documentos ({profissional.documentos_verificados?.length || 0})</h4>
                        <div className="space-y-1">
                          {profissional.documentos_verificados?.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between text-sm">
                              <span>{doc.tipo_documento}</span>
                              <Badge className={getStatusColor(doc.status)} size="sm">
                                {doc.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Certificações ({profissional.certificacoes?.length || 0})</h4>
                        <div className="space-y-1">
                          {profissional.certificacoes?.map((cert) => (
                            <div key={cert.id} className="flex items-center justify-between text-sm">
                              <span className="truncate">{cert.nome}</span>
                              <Badge className={getStatusColor(cert.status)} size="sm">
                                {cert.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProfissional(profissional);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProfissionais.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum profissional pendente
              </h3>
              <p className="text-gray-600">
                Todos os profissionais foram verificados ou não há solicitações pendentes.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Modal de Detalhes */}
      {showDetails && selectedProfissional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Detalhes da Verificação</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedProfissional(null);
                  }}
                >
                  Fechar
                </Button>
              </div>

              <div className="space-y-6">
                {/* Informações do Profissional */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Profissional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Nome: {selectedProfissional.nome}</p>
                        <p className="font-medium">Email: {selectedProfissional.email}</p>
                        <p className="font-medium">Contato: {selectedProfissional.contato}</p>
                      </div>
                      <div>
                        <p className="font-medium">Região: {selectedProfissional.regiao_atuacao}</p>
                        <p className="font-medium">Status: 
                          <Badge className={getStatusColor(selectedProfissional.status_verificacao)}>
                            {selectedProfissional.status_verificacao}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documentos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedProfissional.documentos_verificados?.map((doc) => (
                        <div key={doc.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{doc.tipo_documento}</h4>
                              <p className="text-sm text-gray-600">{doc.numero_documento}</p>
                            </div>
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                          </div>
                          
                          {doc.status === 'PENDENTE' && (
                            <div className="flex space-x-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => handleVerificarDocumento(doc.id, 'VERIFICADO')}
                              >
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerificarDocumento(doc.id, 'REJEITADO')}
                              >
                                Rejeitar
                              </Button>
                            </div>
                          )}
                          
                          {doc.observacoes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Observações:</strong> {doc.observacoes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Certificações */}
                <Card>
                  <CardHeader>
                    <CardTitle>Certificações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedProfissional.certificacoes?.map((cert) => (
                        <div key={cert.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{cert.nome}</h4>
                              <p className="text-sm text-gray-600">{cert.instituicao}</p>
                              {cert.numero_certificado && (
                                <p className="text-sm text-gray-600">Número: {cert.numero_certificado}</p>
                              )}
                            </div>
                            <Badge className={getStatusColor(cert.status)}>
                              {cert.status}
                            </Badge>
                          </div>
                          
                          {cert.status === 'PENDENTE' && (
                            <div className="flex space-x-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => handleVerificarCertificacao(cert.id, 'VERIFICADO')}
                              >
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerificarCertificacao(cert.id, 'REJEITADO')}
                              >
                                Rejeitar
                              </Button>
                            </div>
                          )}
                          
                          {cert.observacoes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Observações:</strong> {cert.observacoes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Ações Finais */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ações de Verificação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => handleAtualizarStatusProfissional(selectedProfissional.id, 'VERIFICADO', 'INTERMEDIARIO')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verificar Conta
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAtualizarStatusProfissional(selectedProfissional.id, 'REJEITADO')}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Rejeitar Verificação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerificacao;
