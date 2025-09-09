const express = require('express');
const prisma = require('../lib/prisma');
const { mapAsaasStatus, mapAsaasBillingType } = require('../lib/asaas');

const router = express.Router();

// Webhook do Asaas para notificações de pagamento
router.post('/asaas', async (req, res) => {
  try {
    const { event, payment, subscription } = req.body;

    console.log('Webhook Asaas recebido:', { event, payment: payment?.id, subscription: subscription?.id });

    switch (event) {
      case 'PAYMENT_CREATED':
        await handlePaymentCreated(payment);
        break;
      
      case 'PAYMENT_UPDATED':
        await handlePaymentUpdated(payment);
        break;
      
      case 'PAYMENT_CONFIRMED':
        await handlePaymentConfirmed(payment);
        break;
      
      case 'PAYMENT_RECEIVED':
        await handlePaymentReceived(payment);
        break;
      
      case 'PAYMENT_OVERDUE':
        await handlePaymentOverdue(payment);
        break;
      
      case 'SUBSCRIPTION_CREATED':
        await handleSubscriptionCreated(subscription);
        break;
      
      case 'SUBSCRIPTION_UPDATED':
        await handleSubscriptionUpdated(subscription);
        break;
      
      default:
        console.log('Evento não tratado:', event);
    }

    res.status(200).json({ message: 'Webhook processado com sucesso' });
  } catch (error) {
    console.error('Erro ao processar webhook Asaas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Função para tratar criação de pagamento
async function handlePaymentCreated(payment) {
  try {
    console.log('Processando criação de pagamento:', payment.id, 'para assinatura:', payment.subscription);
    
    // Buscar assinatura relacionada (tanto para Profissional quanto para Cliente)
    const assinaturaProfissional = await prisma.assinatura.findUnique({
      where: { asaas_subscription_id: payment.subscription }
    });

    const assinaturaCliente = await prisma.assinaturaCliente.findUnique({
      where: { asaas_subscription_id: payment.subscription }
    });

    if (!assinaturaProfissional && !assinaturaCliente) {
      console.log('⚠️ Assinatura não encontrada para o pagamento:', payment.id, 'subscription:', payment.subscription);
      return;
    }
    
    const isCliente = !!assinaturaCliente;
    const assinatura = assinaturaCliente || assinaturaProfissional;
    const pagamentoModel = isCliente ? prisma.pagamentoCliente : prisma.pagamento;

    // Verificar se o pagamento já existe
    const pagamentoExistente = await pagamentoModel.findFirst({
      where: { asaas_payment_id: payment.id }
    });

    if (pagamentoExistente) {
      console.log('✅ Pagamento já existe, atualizando dados:', payment.id);
      
      // Atualizar dados do pagamento existente
      await pagamentoModel.update({
        where: { id: pagamentoExistente.id },
        data: {
          invoice_url: payment.invoiceUrl,
          status: mapAsaasStatus(payment.status),
          metodo_pagamento: mapAsaasBillingType(payment.billingType),
          data_vencimento: new Date(payment.dueDate),
          data_pagamento: payment.paymentDate ? new Date(payment.paymentDate) : null
        }
      });
      return;
    }

    // Criar registro de pagamento
    const novoPagamento = await pagamentoModel.create({
      data: {
        ...(isCliente 
          ? { assinatura_cliente_id: assinatura.id } 
          : { assinatura_id: assinatura.id }),
        asaas_payment_id: payment.id,
        invoice_url: payment.invoiceUrl, // Salvar a URL da fatura
        valor: parseFloat(payment.value),
        status: mapAsaasStatus(payment.status),
        metodo_pagamento: mapAsaasBillingType(payment.billingType),
        data_vencimento: new Date(payment.dueDate),
        data_pagamento: payment.paymentDate ? new Date(payment.paymentDate) : null
      }
    });

    console.log('✅ Novo pagamento criado:', payment.id, 'ID local:', novoPagamento.id);
    
    // Log para debug
    console.log('📋 Detalhes do pagamento:', {
      asaas_id: payment.id,
      valor: payment.value,
      status: payment.status,
      invoice_url: payment.invoiceUrl,
      due_date: payment.dueDate
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar pagamento via webhook:', error);
  }
}

// Função para tratar atualização de pagamento
async function handlePaymentUpdated(payment) {
  try {
    await prisma.pagamento.updateMany({
      where: { asaas_payment_id: payment.id },
      data: {
        status: mapAsaasStatus(payment.status),
        data_pagamento: payment.paymentDate ? new Date(payment.paymentDate) : null
      }
    });

    console.log('Pagamento atualizado:', payment.id);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
  }
}

// Função para tratar confirmação de pagamento
async function handlePaymentConfirmed(payment) {
  try {
    // Atualizar pagamento
    await prisma.pagamento.updateMany({
      where: { asaas_payment_id: payment.id },
      data: {
        status: 'CONFIRMADO',
        data_pagamento: new Date(payment.paymentDate || payment.confirmedDate)
      }
    });

    // Buscar assinatura e ativar se necessário
    const pagamento = await prisma.pagamento.findFirst({
      where: { asaas_payment_id: payment.id },
      include: { assinatura: true }
    });

    if (pagamento && pagamento.assinatura) {
      // Ativar assinatura
      await prisma.assinatura.update({
        where: { id: pagamento.assinatura.id },
        data: { status: 'ATIVO' }
      });

      // Atualizar status do profissional
      await prisma.profissional.update({
        where: { id: pagamento.assinatura.profissional_id },
        data: { status_assinatura: 'ATIVO' }
      });

      console.log('Assinatura ativada:', pagamento.assinatura.id);
    }

    console.log('Pagamento confirmado:', payment.id);
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
  }
}

// Função para tratar recebimento de pagamento
async function handlePaymentReceived(payment) {
  // Mesmo tratamento que confirmação
  await handlePaymentConfirmed(payment);
}

// Função para tratar pagamento vencido
async function handlePaymentOverdue(payment) {
  try {
    // Atualizar pagamento
    await prisma.pagamento.updateMany({
      where: { asaas_payment_id: payment.id },
      data: { status: 'VENCIDO' }
    });

    // Buscar assinatura e desativar se necessário
    const pagamento = await prisma.pagamento.findFirst({
      where: { asaas_payment_id: payment.id },
      include: { assinatura: true }
    });

    if (pagamento && pagamento.assinatura) {
      // Desativar assinatura
      await prisma.assinatura.update({
        where: { id: pagamento.assinatura.id },
        data: { status: 'VENCIDO' }
      });

      // Atualizar status do profissional
      await prisma.profissional.update({
        where: { id: pagamento.assinatura.profissional_id },
        data: { status_assinatura: 'VENCIDO' }
      });

      console.log('Assinatura vencida:', pagamento.assinatura.id);
    }

    console.log('Pagamento vencido:', payment.id);
  } catch (error) {
    console.error('Erro ao processar pagamento vencido:', error);
  }
}

// Função para tratar criação de assinatura
async function handleSubscriptionCreated(subscription) {
  try {
    console.log('Assinatura criada no Asaas:', subscription.id);
    // Lógica adicional se necessário
  } catch (error) {
    console.error('Erro ao processar criação de assinatura:', error);
  }
}

// Função para tratar atualização de assinatura
async function handleSubscriptionUpdated(subscription) {
  try {
    // Atualizar status da assinatura local se necessário
    await prisma.assinatura.updateMany({
      where: { asaas_subscription_id: subscription.id },
      data: {
        // Mapear status se necessário
        status: subscription.status === 'ACTIVE' ? 'ATIVO' : 
               subscription.status === 'INACTIVE' ? 'INATIVO' : 'PENDENTE'
      }
    });

    console.log('Assinatura atualizada:', subscription.id);
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
  }
}

module.exports = router;

