import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';

const AdminClienteDetalhes = () => {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDetalhes = async () => {
    setLoading(true);
    try {
      const [clienteRes, pagamentosRes] = await Promise.all([
        adminAPI.getCliente(id),
        adminAPI.getClientePagamentos(id),
      ]);
      setCliente(clienteRes);
      setPagamentos(pagamentosRes);
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error);
      toast.error('Falha ao buscar detalhes do cliente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalhes();
  }, [id]);

  const handleConfirmarPagamento = async (paymentId) => {
    try {
      await adminAPI.confirmarPagamento(paymentId);
      toast.success('Pagamento confirmado com sucesso!');
      
      // Dispara um evento para que outras abas possam atualizar o estado do usuário
      localStorage.setItem('user_status_updated', Date.now());

      fetchDetalhes(); // Re-fetch data to update UI
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error(error.message || 'Falha ao confirmar pagamento.');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!cliente) {
    return <div>Cliente não encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Detalhes do Cliente</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{cliente.nome}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Email:</strong> {cliente.email}</p>
          <p><strong>Contato:</strong> {cliente.contato}</p>
          <p><strong>Região:</strong> {cliente.regiao}</p>
          <p><strong>Status da Assinatura:</strong> <Badge>{cliente.status_assinatura}</Badge></p>
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
                <TableHead>ID da Fatura</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentos.map((pagamento) => (
                <TableRow key={pagamento.id}>
                  <TableCell className="font-mono">{pagamento.id}</TableCell>
                  <TableCell>{pagamento.assinatura_cliente.plano.nome}</TableCell>
                  <TableCell>R$ {pagamento.valor}</TableCell>
                  <TableCell><Badge>{pagamento.status}</Badge></TableCell>
                  <TableCell>{new Date(pagamento.data_vencimento).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {pagamento.status === 'PENDENTE' && (
                      <Button onClick={() => handleConfirmarPagamento(pagamento.id)}>
                        Confirmar Pagamento
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClienteDetalhes;
