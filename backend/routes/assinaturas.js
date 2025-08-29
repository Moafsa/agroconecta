const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const {
  createCustomer,
  createSubscription,
  cancelSubscription,
  getSubscription,
  getSubscriptionPayments,
  updateCustomer,
  createPayment
} = require('../lib/asaas');

const router = express.Router();

// Funções auxiliares para mapeamento de status e tipos
function mapAsaasStatus(status) {
  const map = {
    'PENDING': 'PENDENTE',
    'RECEIVED': 'CONFIRMADO',
    'CONFIRMED': 'CONFIRMADO',
    'OVERDUE': 'VENCIDO',
    'REFUNDED': 'ESTORNADO',
    'RECEIVED_IN_CASH': 'CONFIRMADO',
    'REFUND_REQUESTED': 'ESTORNADO',
    'CHARGEBACK_REQUESTED': 'ESTORNADO',
    'CHARGEBACK_DISPUTE': 'ESTORNADO',
    'AWAITING_CHARGEBACK_REVERSAL': 'ESTORNADO',
    'DUNNING_REQUESTED': 'VENCIDO',
    'DUNNING_RECEIVED': 'VENCIDO',
    'AWAITING_RISK_ANALYSIS': 'PENDENTE'
  };
  return map[status] || 'PENDENTE';
}

function mapAsaasBillingType(billingType) {
  const map = {
    'PIX': 'PIX',
    'BOLETO': 'BOLETO',
    'CREDIT_CARD': 'CARTAO_CREDITO',
    'DEBIT_CARD': 'CARTAO_DEBITO'
  };
  return map[billingType] || 'BOLETO';
}

// Rota para buscar a assinatura e o histórico de pagamentos do usuário logado
router.get('/minha', auth, async (req, res) => {
  try {
    const user = req.user;
    const userType = req.userType;
    let assinatura;

    if (userType === 'profissional') {
      assinatura = await prisma.assinatura.findFirst({
        where: { profissional_id: user.id },
        orderBy: { data_criacao: 'desc' },
        include: {
          plano: true,
          pagamentos: {
            orderBy: { data_criacao: 'desc' },
          },
        },
      });
    } else if (userType === 'cliente') {
      assinatura = await prisma.assinaturaCliente.findFirst({
        where: { cliente_id: user.id },
        orderBy: { data_criacao: 'desc' },
        include: {
          plano: true,
          pagamentos_cliente: {
            orderBy: { data_criacao: 'desc' },
          },
        },
      });
      // Renomear para manter a consistência da resposta
      if (assinatura) {
        assinatura.pagamentos = assinatura.pagamentos_cliente;
        delete assinatura.pagamentos_cliente;
      }
    }

    if (!assinatura) {
      return res.status(404).json({ message: 'Nenhuma assinatura encontrada.' });
    }

    res.json(assinatura);
  } catch (error) {
    console.error('Erro ao buscar assinatura do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});


// Planos disponíveis
const PLANOS = {
  BASICO: {
    nome: 'Básico',
    valor: 49.90,
    descricao: 'Acesso básico à plataforma',
    recursos: ['Perfil na plataforma', 'Recebimento de leads', 'Suporte por email']
  },
  PREMIUM: {
    nome: 'Premium',
    valor: 99.90,
    descricao: 'Acesso premium com recursos avançados',
    recursos: ['Tudo do Básico', 'Destaque no perfil', 'Relatórios avançados', 'Suporte prioritário']
  },
  ENTERPRISE: {
    nome: 'Enterprise',
    valor: 199.90,
    descricao: 'Solução completa para grandes profissionais',
    recursos: ['Tudo do Premium', 'API personalizada', 'Gerente de conta', 'Integração customizada']
  }
};

// Criar assinatura
router.post('/criar', auth, async (req, res) => {
  try {
    const { plano, billingType = 'PIX' } = req.body;

    if (!PLANOS[plano]) {
      return res.status(400).json({ message: 'Plano inválido' });
    }

    const profissional = await prisma.profissional.findUnique({
      where: { id: req.profissional.id }
    });

    if (!profissional) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }

    let asaasCustomerId = profissional.asaas_customer_id;

    // Criar ou atualizar cliente no Asaas se necessário
    if (!asaasCustomerId) {
      const asaasCustomer = await createCustomer(profissional);
      asaasCustomerId = asaasCustomer.id;

      // Atualizar profissional com ID do cliente Asaas
      await prisma.profissional.update({
        where: { id: profissional.id },
        data: { asaas_customer_id: asaasCustomerId }
      });
    }

    // Calcular próxima data de vencimento (30 dias a partir de hoje)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 30);

    // Criar assinatura no Asaas
    const asaasSubscription = await createSubscription(asaasCustomerId, {
      value: PLANOS[plano].valor,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: `Assinatura ${PLANOS[plano].nome} - Agro-Conecta`,
      billingType,
      externalReference: `prof_${profissional.id}_${plano}`
    });

    // Salvar assinatura no banco local
    const assinatura = await prisma.assinatura.create({
      data: {
        profissional_id: profissional.id,
        asaas_subscription_id: asaasSubscription.id,
        plano,
        valor: PLANOS[plano].valor,
        status: 'PENDENTE',
        data_inicio: new Date(),
        data_fim: null
      }
    });

    res.status(201).json({
      message: 'Assinatura criada com sucesso',
      assinatura,
      asaas_subscription: asaasSubscription
    });
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar assinaturas do profissional
router.get('/minhas', auth, async (req, res) => {
  try {
    const assinaturas = await prisma.assinatura.findMany({
      where: { profissional_id: req.profissional.id },
      include: {
        pagamentos: {
          orderBy: { data_criacao: 'desc' },
          take: 5
        }
      },
      orderBy: { data_criacao: 'desc' }
    });

    // Enriquecer com dados dos planos
    const assinaturasComPlanos = assinaturas.map(assinatura => ({
      ...assinatura,
      plano_info: PLANOS[assinatura.plano]
    }));

    res.json(assinaturasComPlanos);
  } catch (error) {
    console.error('Erro ao listar assinaturas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar assinatura específica
router.get('/:id', auth, async (req, res) => {
  try {
    const assinatura = await prisma.assinatura.findUnique({
      where: { id: req.params.id },
      include: {
        profissional: true,
        pagamentos: {
          orderBy: { data_criacao: 'desc' }
        }
      }
    });

    if (!assinatura) {
      return res.status(404).json({ message: 'Assinatura não encontrada' });
    }

    // Verificar se o profissional tem acesso
    if (assinatura.profissional_id !== req.profissional.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Buscar dados atualizados no Asaas
    try {
      const asaasSubscription = await getSubscription(assinatura.asaas_subscription_id);
      const asaasPayments = await getSubscriptionPayments(assinatura.asaas_subscription_id);

      res.json({
        ...assinatura,
        plano_info: PLANOS[assinatura.plano],
        asaas_subscription: asaasSubscription,
        asaas_payments: asaasPayments
      });
    } catch (asaasError) {
      console.error('Erro ao buscar dados no Asaas:', asaasError);
      res.json({
        ...assinatura,
        plano_info: PLANOS[assinatura.plano]
      });
    }
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Cancelar assinatura
router.post('/:id/cancelar', auth, async (req, res) => {
  try {
    const assinatura = await prisma.assinatura.findUnique({
      where: { id: req.params.id }
    });

    if (!assinatura) {
      return res.status(404).json({ message: 'Assinatura não encontrada' });
    }

    // Verificar se o profissional tem acesso
    if (assinatura.profissional_id !== req.profissional.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Cancelar no Asaas
    await cancelSubscription(assinatura.asaas_subscription_id);

    // Atualizar status local
    const assinaturaAtualizada = await prisma.assinatura.update({
      where: { id: req.params.id },
      data: {
        status: 'CANCELADO',
        data_fim: new Date()
      }
    });

    // Atualizar status do profissional
    await prisma.profissional.update({
      where: { id: req.profissional.id },
      data: { status_assinatura: 'CANCELADO' }
    });

    res.json({
      message: 'Assinatura cancelada com sucesso',
      assinatura: assinaturaAtualizada
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Reativar assinatura
router.post('/:id/reativar', auth, async (req, res) => {
  try {
    const { billingType = 'PIX' } = req.body;

    const assinatura = await prisma.assinatura.findUnique({
      where: { id: req.params.id },
      include: { profissional: true }
    });

    if (!assinatura) {
      return res.status(404).json({ message: 'Assinatura não encontrada' });
    }

    // Verificar se o profissional tem acesso
    if (assinatura.profissional_id !== req.profissional.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    if (assinatura.status === 'ATIVO') {
      return res.status(400).json({ message: 'Assinatura já está ativa' });
    }

    // Criar nova assinatura no Asaas
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 30);

    const asaasSubscription = await createSubscription(assinatura.profissional.asaas_customer_id, {
      value: PLANOS[assinatura.plano].valor,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: `Assinatura ${PLANOS[assinatura.plano].nome} - Agro-Conecta (Reativada)`,
      billingType,
      externalReference: `prof_${assinatura.profissional.id}_${assinatura.plano}_reativada`
    });

    // Atualizar assinatura local
    const assinaturaAtualizada = await prisma.assinatura.update({
      where: { id: req.params.id },
      data: {
        asaas_subscription_id: asaasSubscription.id,
        status: 'PENDENTE',
        data_fim: null
      }
    });

    res.json({
      message: 'Assinatura reativada com sucesso',
      assinatura: assinaturaAtualizada,
      asaas_subscription: asaasSubscription
    });
  } catch (error) {
    console.error('Erro ao reativar assinatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para criar a ASSINATURA e obter o checkout da PRIMEIRA cobrança
router.post('/pagamento-direto', auth, async (req, res) => {
  try {
    const { planoId, billingType = 'PIX' } = req.body;
    const user = req.user;

    const plano = await prisma.plano.findUnique({ where: { id: planoId } });
    if (!plano) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 1. Obter ou criar cliente na Asaas
    let asaasCustomerId = user.asaas_customer_id;
    if (!asaasCustomerId) {
      const asaasCustomer = await createCustomer(user);
      asaasCustomerId = asaasCustomer.id;

      const userUpdateData = { asaas_customer_id: asaasCustomerId };
      if (req.userType === 'cliente') {
        await prisma.cliente.update({ where: { id: user.id }, data: userUpdateData });
      } else {
        await prisma.profissional.update({ where: { id: user.id }, data: userUpdateData });
      }
    }

    // 2. Criar a ASSINATURA na Asaas
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 3);

    const subscriptionPayload = {
      customer: asaasCustomerId,
      value: parseFloat(plano.valor),
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      cycle: 'MONTHLY', // ou outro ciclo, conforme o plano
      billingType,
      description: `Assinatura Plano ${plano.nome} - Agro-Conecta`,
      externalReference: `user_${user.id}_plano_${plano.id}`,
    };

    const asaasSubscription = await createSubscription(subscriptionPayload);

    // 3. Salvar a assinatura em nosso banco de dados local
    const isCliente = req.userType === 'cliente';
    const subscriptionModel = isCliente ? prisma.assinaturaCliente : prisma.assinatura;
    const newSubscription = await subscriptionModel.create({
      data: {
        ...(isCliente ? { cliente_id: user.id } : { profissional_id: user.id }),
        plano_id: plano.id,
        asaas_subscription_id: asaasSubscription.id,
        valor: parseFloat(plano.valor),
        status: 'PENDENTE', // Será atualizado por webhook
        data_inicio: new Date(),
        data_fim: null,
      },
    });

    // 4. Buscar a primeira cobrança gerada para a assinatura
    console.log(`Buscando pagamentos para a assinatura Asaas ID: ${asaasSubscription.id}`);
    const paymentsResponse = await getSubscriptionPayments(asaasSubscription.id);
    console.log('Resposta da busca de pagamentos:', JSON.stringify(paymentsResponse, null, 2));


    if (!paymentsResponse || !paymentsResponse.data || paymentsResponse.data.length === 0) {
      console.error("Asaas criou a assinatura mas não retornou nenhuma cobrança associada.", asaasSubscription);
      // Mesmo sem a fatura, vamos retornar a assinatura para que o usuário possa ser atualizado
      return res.status(201).json({
          message: 'Assinatura criada, mas aguardando geração da fatura.',
          checkout_url: null, // Indicar que a URL não está disponível ainda
          asaas_subscription: asaasSubscription
      });
    }

    const firstPayment = paymentsResponse.data[0];
    const checkoutUrl = firstPayment.invoiceUrl;
    
    // 5. Salvar a primeira fatura no nosso banco de dados
    const pagamentoModel = isCliente ? prisma.pagamentoCliente : prisma.pagamento;
    await pagamentoModel.create({
        data: {
          ...(isCliente 
            ? { assinatura_cliente_id: newSubscription.id } 
            : { assinatura_id: newSubscription.id }),
          asaas_payment_id: firstPayment.id,
          invoice_url: firstPayment.invoiceUrl,
          valor: parseFloat(firstPayment.value),
          status: mapAsaasStatus(firstPayment.status),
          metodo_pagamento: mapAsaasBillingType(firstPayment.billingType),
          data_vencimento: new Date(firstPayment.dueDate),
        }
    });

    // 6. Atualizar a assinatura com a URL do pagamento pendente
    await subscriptionModel.update({
       where: { id: newSubscription.id },
       data: { pending_payment_url: checkoutUrl }
    });

    if (!checkoutUrl) {
        console.error("A primeira cobrança da assinatura não contém um checkoutUrl.", firstPayment);
        return res.status(500).json({ message: "Não foi possível gerar o link de pagamento para a assinatura." });
    }

    res.status(201).json({
      message: 'Assinatura criada com sucesso. Redirecionando para pagamento.',
      checkout_url: checkoutUrl,
      asaas_subscription: asaasSubscription,
      asaas_payment: firstPayment
    });

  } catch (error) {
    console.error('Erro no processo de criação de assinatura:', error.response?.data || error.message);
    res.status(500).json({ message: 'Erro interno do servidor ao processar a assinatura.' });
  }
});

module.exports = router;

