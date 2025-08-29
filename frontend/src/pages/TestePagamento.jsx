import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { testAPI } from '@/lib/api';
import { Loader2, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TestePagamento = () => {
  const [loading, setLoading] = useState(null); // 'pix', 'card', or null
  const [error, setError] = useState('');

  const handleGenerateLink = async (billingType) => {
    setLoading(billingType);
    setError('');
    try {
      const response = await testAPI.generateTestLink(billingType);
      if (response.checkout_url) {
        // Redirecionar para o checkout em uma nova aba
        window.open(response.checkout_url, '_blank');
      } else {
        setError('A API não retornou um URL de checkout.');
      }
    } catch (err) {
      console.error('Erro ao gerar link de teste:', err);
      const errorMessage = err.message || 'Ocorreu um erro desconhecido.';
      setError(`Falha ao gerar link (${billingType}): ${errorMessage}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Página de Teste de Pagamento Asaas</CardTitle>
          <CardDescription>
            Use os botões abaixo para gerar um link de checkout de teste diretamente da Asaas,
            sem passar pelo fluxo de autenticação ou registro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => handleGenerateLink('PIX')}
              disabled={!!loading}
              size="lg"
            >
              {loading === 'pix' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Gerar Checkout PIX (R$ 1,00)
            </Button>
            <Button
              onClick={() => handleGenerateLink('CREDIT_CARD')}
              disabled={!!loading}
              size="lg"
            >
              {loading === 'card' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Gerar Checkout Cartão (R$ 1,00)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestePagamento;
