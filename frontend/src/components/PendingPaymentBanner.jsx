import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const PendingPaymentBanner = ({ paymentUrl }) => {
  if (!paymentUrl) {
    return null;
  }

  const handleRedirect = () => {
    window.open(paymentUrl, '_blank');
  };

  return (
    <Alert className="mb-4 border-yellow-500 text-yellow-700">
      <Terminal className="h-4 w-4" />
      <AlertTitle className="font-bold">Pagamento Pendente</AlertTitle>
      <AlertDescription className="flex justify-between items-center">
        Sua assinatura está aguardando o pagamento. Por favor, conclua o processo para ter acesso total aos recursos da plataforma.
        <Button onClick={handleRedirect} variant="outline" size="sm" className="ml-4 bg-yellow-500 hover:bg-yellow-600 text-white">
          Concluir Pagamento
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default PendingPaymentBanner;
