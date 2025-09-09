import React, { useState, useEffect } from 'react';
import { subscriptionAPI } from '@/lib/api';
import DashboardMenu from '@/components/DashboardMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ExternalLink, Menu } from 'lucide-react';

const Subscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const data = await subscriptionAPI.getMySubscription();
        setSubscription(data);
      } catch (err) {
        setError('Não foi possível carregar os dados da sua assinatura. ' + (err.message || ''));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ATIVO': return <Badge variant="success">Ativo</Badge>;
      case 'PENDENTE': return <Badge variant="warning">Pendente</Badge>;
      case 'VENCIDO': return <Badge variant="destructive">Vencido</Badge>;
      case 'CANCELADO': return <Badge variant="secondary">Cancelado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
        case 'CONFIRMADO': return <Badge variant="success">Confirmado</Badge>;
        case 'PENDENTE': return <Badge variant="warning">Pendente</Badge>;
        case 'VENCIDO': return <Badge variant="destructive">Vencido</Badge>;
        default: return <Badge>{status}</Badge>;
      }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardMenu isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p>Carregando assinatura...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardMenu isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
        <div className="flex-1 lg:ml-64 p-4">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-4" />
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardMenu isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
        <div className="flex-1 lg:ml-64 p-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p>Nenhuma assinatura encontrada.</p>
            </CardContent>
          </Card>
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
            <h1 className="text-lg font-semibold">Assinatura</h1>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </div>

        <main className="p-4 lg:p-8 space-y-6">
          <h1 className="text-3xl font-bold">Gerenciar Assinatura</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Detalhes do Plano</span>
              {getStatusBadge(subscription.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">{subscription.plano.nome}</p>
              <p className="text-sm text-gray-500">{subscription.plano.descricao}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">R$ {parseFloat(subscription.valor).toFixed(2)} /mês</p>
              <p className="text-sm text-gray-500">
                Próxima cobrança: {subscription.data_proxima_cobranca ? formatDate(subscription.data_proxima_cobranca) : 'A ser definida'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Faturas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscription.pagamentos && subscription.pagamentos.length > 0 ? (
                  subscription.pagamentos.map((pagamento) => (
                    <TableRow key={pagamento.id}>
                      <TableCell>{formatDate(pagamento.data_criacao)}</TableCell>
                      <TableCell>R$ {parseFloat(pagamento.valor).toFixed(2)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(pagamento.status)}</TableCell>
                      <TableCell className="text-right">
                        {pagamento.invoice_url && (
                          <Button as="a" href={pagamento.invoice_url} target="_blank" variant="outline" size="sm">
                            Ver Fatura <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="4" className="text-center">Nenhuma fatura encontrada.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </main>
      </div>
    </div>
  );
};

export default Subscription;

