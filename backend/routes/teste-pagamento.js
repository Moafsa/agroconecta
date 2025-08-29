const express = require('express');
const prisma = require('../lib/prisma');
const { createCustomer, createSubscription } = require('../lib/asaas');

const router = express.Router();

// Endpoint de teste para gerar um link de pagamento da Asaas
router.post('/gerar-link', async (req, res) => {
  try {
    const { billingType } = req.body;

    if (!billingType || !['PIX', 'CREDIT_CARD'].includes(billingType)) {
      return res.status(400).json({ message: "Método de pagamento ('billingType') é obrigatório: PIX ou CREDIT_CARD." });
    }

    // 1. Dados Fictícios do Cliente
    const mockUser = {
      id: `test_${new Date().getTime()}`,
      nome: 'Cliente de Teste',
      email: `teste@${new Date().getTime()}.com`,
      contato: '51999999999',
    };

    // 2. Buscar a Chave PIX do Admin (se necessário)
    let adminPixKey = null;
    if (billingType === 'PIX') {
      const admin = await prisma.admin.findFirst({
        where: { ativo: true },
        select: { pix_wallet: true },
      });
      if (!admin || !admin.pix_wallet) {
        return res.status(500).json({ message: 'ERRO CRÍTICO: Chave PIX do admin não está configurada no perfil.' });
      }
      adminPixKey = admin.pix_wallet;
    }

    // 3. Criar Cliente na Asaas
    const asaasCustomer = await createCustomer(mockUser);
    const asaasCustomerId = asaasCustomer.id;

    // 4. Criar Assinatura na Asaas
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    const subscriptionPayload = {
      customer: asaasCustomerId,
      value: 1.00, // Valor simbólico para teste
      nextDueDate: dueDate.toISOString().split('T')[0],
      cycle: 'MONTHLY',
      billingType,
      description: `Assinatura de Teste (${billingType})`,
      externalReference: `test_${mockUser.id}`,
    };

    if (billingType === 'PIX' && adminPixKey) {
        // O campo correto para chave PIX na criação de assinatura é `remoteIp` para o QR Code dinâmico,
        // mas a chave em si pode ser vinculada à subconta. A API pode não aceitar uma chave aleatória.
        // Vamos testar a estrutura mais simples primeiro.
        // A documentação sugere que a chave principal da conta é usada por padrão.
    }

    const asaasSubscription = await createSubscription(subscriptionPayload);

    // 5. Extrair e Retornar o Link de Checkout
    const checkoutUrl = asaasSubscription.invoiceUrl;
    if (!checkoutUrl) {
      return res.status(500).json({ message: 'Asaas não retornou um URL de checkout.' });
    }

    console.log(`[TESTE] Link de Checkout (${billingType}) gerado: ${checkoutUrl}`);

    res.status(200).json({
      message: 'Link de teste gerado com sucesso!',
      checkout_url: checkoutUrl,
    });

  } catch (error) {
    console.error('[ERRO NO TESTE DE PAGAMENTO]:', error.response?.data || error.message);
    res.status(500).json({ message: 'Falha ao gerar link de teste da Asaas.', error: error.response?.data || error.message });
  }
});

module.exports = router;
