const express = require('express');
const prisma = require('../lib/prisma');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Rota para confirmar um pagamento manualmente (marcar como pago)
router.post('/:paymentId/confirmar', adminAuth, async (req, res) => {
  const { paymentId } = req.params;

  try {
    let updatedPayment;
    let subscription;
    let userType;

    // Tenta encontrar como PagamentoCliente
    const pagamentoCliente = await prisma.pagamentoCliente.findUnique({
      where: { id: paymentId },
      include: { assinatura_cliente: true },
    });

    if (pagamentoCliente) {
      // Atualiza o PagamentoCliente
      updatedPayment = await prisma.pagamentoCliente.update({
        where: { id: paymentId },
        data: { status: 'CONFIRMADO', data_pagamento: new Date() },
      });

      // Atualiza a AssinaturaCliente
      subscription = await prisma.assinaturaCliente.update({
        where: { id: pagamentoCliente.assinatura_cliente_id },
        data: { status: 'ATIVO' },
      });

      // Atualiza o Cliente
      await prisma.cliente.update({
        where: { id: subscription.cliente_id },
        data: { status_assinatura: 'ATIVO' },
      });
      userType = 'cliente';

    } else {
      // Tenta encontrar como Pagamento (de Profissional)
      const pagamentoProfissional = await prisma.pagamento.findUnique({
        where: { id: paymentId },
        include: { assinatura: true },
      });

      if (pagamentoProfissional) {
        // Atualiza o Pagamento
        updatedPayment = await prisma.pagamento.update({
          where: { id: paymentId },
          data: { status: 'CONFIRMADO', data_pagamento: new Date() },
        });

        // Atualiza a Assinatura
        subscription = await prisma.assinatura.update({
          where: { id: pagamentoProfissional.assinatura_id },
          data: { status: 'ATIVO' },
        });

        // Atualiza o Profissional
        await prisma.profissional.update({
          where: { id: subscription.profissional_id },
          data: { status_assinatura: 'ATIVO' },
        });
        userType = 'profissional';

      } else {
        return res.status(404).json({ message: 'Fatura não encontrada.' });
      }
    }

    res.json({
      message: 'Fatura confirmada com sucesso!',
      payment: updatedPayment,
      subscription,
      userType,
    });

  } catch (error) {
    console.error('Erro ao confirmar fatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao confirmar a fatura.' });
  }
});

module.exports = router;
