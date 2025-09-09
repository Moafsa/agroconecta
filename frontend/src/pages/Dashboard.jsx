import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PendingPaymentBanner from '@/components/PendingPaymentBanner';
import { interactionAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Award,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Eye,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interactions, setInteractions] = useState([]);
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPending = user?.status_assinatura === 'PENDENTE';

  useEffect(() => {
    // Redireciona para completar o perfil se for um novo usuário
    if (user?.isNewUser) {
      navigate('/profile');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar interações
        const interactionsData = await interactionAPI.getInteractions({});
        setInteractions(interactionsData.interacoes);
        
        // Buscar dados de verificação
        const token = localStorage.getItem('token');
        const verificationResponse = await fetch('/api/verificacao/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (verificationResponse.ok) {
          const verificationData = await verificationResponse.json();
          setVerificationData(verificationData);
        }
        
        setError(null);
      } catch (err) {
        setError('Não foi possível carregar os dados.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const renderAction = (interaction) => {
    const actionButton = (
      <Button 
        size="sm" 
        disabled={isPending}
        onClick={() => !isPending && alert(`Abrindo chat para interação ${interaction.id}`)}
      >
        Responder
      </Button>
    );

    if (isPending) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* O span é necessário para o Tooltip funcionar em botões desabilitados */}
              <span tabIndex="0">{actionButton}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Conclua o pagamento para responder.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return actionButton;
  };

  const getVerificationStatusColor = (status) => {
    const colors = {
      'PENDENTE': 'bg-yellow-100 text-yellow-800',
      'EM_ANALISE': 'bg-blue-100 text-blue-800',
      'VERIFICADO': 'bg-green-100 text-green-800',
      'REJEITADO': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getVerificationLevelColor = (level) => {
    const colors = {
      'BASICO': 'bg-gray-100 text-gray-800',
      'INTERMEDIARIO': 'bg-blue-100 text-blue-800',
      'AVANCADO': 'bg-purple-100 text-purple-800',
      'PREMIUM': 'bg-yellow-100 text-yellow-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const calculateVerificationProgress = () => {
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
  
  return (
    <main className="container mx-auto p-4 space-y-6">
      {isPending && (
        <PendingPaymentBanner paymentUrl={user.pending_payment_url} />
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo, {user?.nome}!</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/profile')}>
            <Eye className="h-4 w-4 mr-2" />
            Ver Perfil
          </Button>
          <Button onClick={() => navigate('/verificacao')}>
            <Plus className="h-4 w-4 mr-2" />
            Verificar Conta
          </Button>
        </div>
      </div>

      {/* Status de Verificação */}
      {verificationData && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Status de Verificação</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getVerificationStatusColor(verificationData.status_verificacao)}>
                    {verificationData.status_verificacao}
                  </Badge>
                  {verificationData.nivel_verificacao && (
                    <Badge className={getVerificationLevelColor(verificationData.nivel_verificacao)}>
                      {verificationData.nivel_verificacao}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {verificationData.status_verificacao === 'VERIFICADO' 
                    ? 'Sua conta está verificada!' 
                    : 'Complete a verificação para aumentar sua credibilidade'
                  }
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-sm text-gray-600">{Math.round(calculateVerificationProgress())}%</span>
                </div>
                <Progress value={calculateVerificationProgress()} className="h-2" />
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {verificationData.documentos?.length || 0} documentos
                </div>
                <div className="text-sm text-gray-600">
                  {verificationData.certificacoes?.length || 0} certificações
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas Interações</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interactions.length}</div>
            <p className="text-xs text-muted-foreground">Solicitações de produtores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">Média de avaliações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Especialidades</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.especialidades?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Áreas de atuação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge className={getVerificationStatusColor(verificationData?.status_verificacao || 'PENDENTE')}>
                {verificationData?.status_verificacao || 'PENDENTE'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Verificação da conta</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Interações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Carregando interações...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && interactions.length === 0 && <p>Nenhuma interação encontrada.</p>}
          
          <div className="space-y-4">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                <div>
                  <p className="font-semibold">Produtor: {interaction.produtor_id}</p>
                  <p className="text-sm text-muted-foreground">{interaction.detalhes}</p>
                </div>
                {renderAction(interaction)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Dashboard;

