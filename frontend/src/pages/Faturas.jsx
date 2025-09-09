import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardMenu from '@/components/DashboardMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  ExternalLink, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Calendar,
  DollarSign,
  Menu,
  RefreshCw
} from 'lucide-react';

const Faturas = () => {
  const { user } = useAuth();
  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchFaturas();
  }, []);

  const fetchFaturas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/faturas/minhas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFaturas(data.faturas || []);
      } else {
        setError('Erro ao carregar faturas');
      }
    } catch (error) {
      console.error('Erro ao buscar faturas:', error);
      setError('Erro ao carregar faturas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDENTE': 'bg-yellow-100 text-yellow-800',
      'CONFIRMADO': 'bg-green-100 text-green-800',
      'VENCIDO': 'bg-red-100 text-red-800',
      'CANCELADO': 'bg-gray-100 text-gray-800',
      'ESTORNADO': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMADO':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDENTE':
        return <Clock className="h-4 w-4" />;
      case 'VENCIDO':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePayInvoice = (invoiceUrl) => {
    if (invoiceUrl) {
      window.open(invoiceUrl, '_blank');
    }
  };

  const handleDownloadInvoice = (invoiceUrl) => {
    if (invoiceUrl) {
      window.open(invoiceUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardMenu isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando faturas...</p>
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
            <h1 className="text-lg font-semibold">Faturas</h1>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </div>

        <main className="p-4 lg:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Faturas</h1>
              <p className="text-muted-foreground">Histórico de faturas e pagamentos</p>
            </div>
            <Button onClick={fetchFaturas} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Resumo das faturas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold">
                      {faturas.filter(f => f.status === 'PENDENTE').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pagas</p>
                    <p className="text-2xl font-bold">
                      {faturas.filter(f => f.status === 'CONFIRMADO').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pago</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        faturas
                          .filter(f => f.status === 'CONFIRMADO')
                          .reduce((sum, f) => sum + parseFloat(f.valor), 0)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de faturas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Histórico de Faturas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {faturas.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma fatura encontrada
                  </h3>
                  <p className="text-gray-600">
                    Suas faturas aparecerão aqui quando forem geradas.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {faturas.map((fatura) => (
                    <div key={fatura.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold">
                              Fatura #{fatura.asaas_payment_id}
                            </h3>
                            <Badge className={getStatusColor(fatura.status)}>
                              {getStatusIcon(fatura.status)}
                              <span className="ml-1">{fatura.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">
                                {formatCurrency(fatura.valor)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Vencimento: {formatDate(fatura.data_vencimento)}</span>
                            </div>
                            
                            {fatura.data_pagamento && (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>Pago em: {formatDate(fatura.data_pagamento)}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4" />
                              <span>{fatura.metodo_pagamento}</span>
                            </div>
                          </div>

                          {fatura.assinatura && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Plano:</span> {fatura.assinatura.plano.nome}
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          {fatura.status === 'PENDENTE' && fatura.invoice_url && (
                            <Button
                              size="sm"
                              onClick={() => handlePayInvoice(fatura.invoice_url)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Pagar
                            </Button>
                          )}
                          
                          {fatura.invoice_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadInvoice(fatura.invoice_url)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Baixar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações sobre pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Informações sobre Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Métodos de Pagamento Aceitos:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• PIX (pagamento instantâneo)</li>
                    <li>• Boleto bancário</li>
                    <li>• Cartão de crédito</li>
                    <li>• Cartão de débito</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Dúvidas sobre Pagamento:</h4>
                  <p className="text-sm text-gray-600">
                    Se você tiver problemas com o pagamento ou precisar de ajuda, 
                    entre em contato conosco através do chat ou email.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Faturas;
