import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PendingPaymentBanner from '@/components/PendingPaymentBanner';
import { interactionAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interactions, setInteractions] = useState([]);
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
    const fetchInteractions = async () => {
      try {
        setLoading(true);
        // A API espera um objeto de filtros, mesmo que vazio
        const data = await interactionAPI.getInteractions({});
        // Corrigido: Acessar a propriedade 'interacoes' da resposta
        setInteractions(data.interacoes); 
        setError(null);
      } catch (err) {
        setError('Não foi possível carregar as interações.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInteractions();
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
  
  return (
    <main className="container mx-auto p-4 space-y-6">
      {isPending && (
        <PendingPaymentBanner paymentUrl={user.pending_payment_url} />
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {user && <p className="text-muted-foreground">Bem-vindo, {user.nome}!</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Novas Interações</CardTitle>
                  {/* Ícone aqui */}
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{interactions.length}</div>
                  <p className="text-xs text-muted-foreground">Novas solicitações de produtores</p>
              </CardContent>
          </Card>
          {/* Outros cards de estatísticas podem ser adicionados aqui */}
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

