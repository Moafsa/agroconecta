import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardMenu from '@/components/DashboardMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Award, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  X,
  Eye,
  Download,
  Menu
} from 'lucide-react';

const Verificacao = () => {
  const { user } = useAuth();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Estados para formulários
  const [documentForm, setDocumentForm] = useState({
    tipo_documento: '',
    numero_documento: '',
    arquivo_url: ''
  });
  
  const [certificationForm, setCertificationForm] = useState({
    nome: '',
    instituicao: '',
    numero_certificado: '',
    data_emissao: '',
    data_validade: '',
    arquivo_url: ''
  });

  useEffect(() => {
    fetchVerificationData();
  }, []);

  const fetchVerificationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/verificacao/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVerificationData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de verificação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/verificacao/documentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(documentForm)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setDocumentForm({ tipo_documento: '', numero_documento: '', arquivo_url: '' });
        fetchVerificationData();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao enviar documento' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCertificationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/verificacao/certificacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(certificationForm)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setCertificationForm({
          nome: '',
          instituicao: '',
          numero_certificado: '',
          data_emissao: '',
          data_validade: '',
          arquivo_url: ''
        });
        fetchVerificationData();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao enviar certificação' });
    } finally {
      setSubmitting(false);
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

  const calculateProgress = () => {
    if (!verificationData) return 0;
    
    let progress = 0;
    const totalSteps = 4;
    
    // CPF/CNPJ verificado
    if (verificationData.documentos?.some(doc => doc.tipo_documento === 'CPF' && doc.status === 'VERIFICADO')) {
      progress += 1;
    }
    
    // Documento profissional verificado
    if (verificationData.documentos?.some(doc => ['CRMV', 'CREA', 'CERTIFICADO_PROFISSIONAL'].includes(doc.tipo_documento) && doc.status === 'VERIFICADO')) {
      progress += 1;
    }
    
    // Certificação verificada
    if (verificationData.certificacoes?.some(cert => cert.status === 'VERIFICADO')) {
      progress += 1;
    }
    
    // Perfil completo
    if (user?.regiao_atuacao && user?.especialidades?.length > 0) {
      progress += 1;
    }
    
    return (progress / totalSteps) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardMenu isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados de verificação...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Menu lateral */}
      <DashboardMenu isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
      
      {/* Conteúdo principal */}
      <div className="flex-1 lg:ml-64">
        {/* Header mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Verificação</h1>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </div>

        <main className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Verificação de Conta</h1>
              <p className="text-gray-600 mt-2">
                Complete a verificação da sua conta para aumentar sua credibilidade e receber mais oportunidades
              </p>
            </div>

        {message.text && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Status Geral */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Status de Verificação</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getStatusColor(verificationData?.status_verificacao || 'PENDENTE')}>
                    {verificationData?.status_verificacao || 'PENDENTE'}
                  </Badge>
                  {verificationData?.nivel_verificacao && (
                    <Badge variant="outline">
                      {verificationData.nivel_verificacao}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {verificationData?.status_verificacao === 'VERIFICADO' 
                    ? 'Sua conta está verificada!' 
                    : 'Complete a verificação para aumentar sua credibilidade'
                  }
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-sm text-gray-600">{Math.round(calculateProgress())}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(calculateProgress() / 25)} de 4 etapas concluídas
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {verificationData?.documentos?.length || 0} documentos enviados
                </div>
                <div className="text-sm text-gray-600">
                  {verificationData?.certificacoes?.length || 0} certificações enviadas
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Documentos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de documentos */}
              {verificationData?.documentos?.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(doc.status)}
                    <div>
                      <p className="font-medium">{doc.tipo_documento}</p>
                      <p className="text-sm text-gray-600">{doc.numero_documento}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                </div>
              ))}

              {/* Formulário de novo documento */}
              <form onSubmit={handleDocumentSubmit} className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="tipo_documento">Tipo de Documento</Label>
                  <select
                    id="tipo_documento"
                    value={documentForm.tipo_documento}
                    onChange={(e) => setDocumentForm({...documentForm, tipo_documento: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="RG">RG</option>
                    <option value="CRMV">CRMV</option>
                    <option value="CREA">CREA</option>
                    <option value="CERTIFICADO_PROFISSIONAL">Certificado Profissional</option>
                    <option value="DIPLOMA">Diploma</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero_documento">Número do Documento</Label>
                  <Input
                    id="numero_documento"
                    value={documentForm.numero_documento}
                    onChange={(e) => setDocumentForm({...documentForm, numero_documento: e.target.value})}
                    placeholder="Digite o número do documento"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arquivo_url">URL do Arquivo (opcional)</Label>
                  <Input
                    id="arquivo_url"
                    value={documentForm.arquivo_url}
                    onChange={(e) => setDocumentForm({...documentForm, arquivo_url: e.target.value})}
                    placeholder="https://exemplo.com/documento.pdf"
                    type="url"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Enviando...' : 'Enviar Documento'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Certificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Certificações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de certificações */}
              {verificationData?.certificacoes?.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(cert.status)}
                    <div>
                      <p className="font-medium">{cert.nome}</p>
                      <p className="text-sm text-gray-600">{cert.instituicao}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(cert.status)}>
                    {cert.status}
                  </Badge>
                </div>
              ))}

              {/* Formulário de nova certificação */}
              <form onSubmit={handleCertificationSubmit} className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="nome_cert">Nome da Certificação</Label>
                  <Input
                    id="nome_cert"
                    value={certificationForm.nome}
                    onChange={(e) => setCertificationForm({...certificationForm, nome: e.target.value})}
                    placeholder="Ex: Curso de Agronomia"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instituicao">Instituição</Label>
                  <Input
                    id="instituicao"
                    value={certificationForm.instituicao}
                    onChange={(e) => setCertificationForm({...certificationForm, instituicao: e.target.value})}
                    placeholder="Ex: Universidade Federal"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_emissao">Data de Emissão</Label>
                    <Input
                      id="data_emissao"
                      type="date"
                      value={certificationForm.data_emissao}
                      onChange={(e) => setCertificationForm({...certificationForm, data_emissao: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_validade">Data de Validade (opcional)</Label>
                    <Input
                      id="data_validade"
                      type="date"
                      value={certificationForm.data_validade}
                      onChange={(e) => setCertificationForm({...certificationForm, data_validade: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero_certificado">Número do Certificado (opcional)</Label>
                  <Input
                    id="numero_certificado"
                    value={certificationForm.numero_certificado}
                    onChange={(e) => setCertificationForm({...certificationForm, numero_certificado: e.target.value})}
                    placeholder="Número do certificado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arquivo_cert">URL do Certificado (opcional)</Label>
                  <Input
                    id="arquivo_cert"
                    value={certificationForm.arquivo_url}
                    onChange={(e) => setCertificationForm({...certificationForm, arquivo_url: e.target.value})}
                    placeholder="https://exemplo.com/certificado.pdf"
                    type="url"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Enviando...' : 'Enviar Certificação'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Informações sobre verificação */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Como funciona a verificação?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Documentos necessários:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• CPF ou CNPJ</li>
                  <li>• Documento profissional (CRMV, CREA, etc.)</li>
                  <li>• Certificações relevantes</li>
                  <li>• Diploma ou certificado de curso</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Benefícios da verificação:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Maior credibilidade na plataforma</li>
                  <li>• Destaque no perfil</li>
                  <li>• Mais oportunidades de trabalho</li>
                  <li>• Confiança dos produtores</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Verificacao;
