const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');

const router = express.Router();

// ===== ROTAS PARA PROFISSIONAIS =====

// Buscar faturas do profissional autenticado
router.get('/minhas', auth, async (req, res) => {
  try {
    const faturas = await prisma.pagamento.findMany({
      where: {
        assinatura: {
          profissional_id: req.profissional.id
        }
      },
      include: {
        assinatura: {
          include: {
            plano: {
              select: {
                id: true,
                nome: true,
                descricao: true
              }
            }
          }
        }
      },
      orderBy: {
        data_criacao: 'desc'
      }
    });

    res.json({
      faturas: faturas.map(fatura => ({
        id: fatura.id,
        asaas_payment_id: fatura.asaas_payment_id,
        valor: parseFloat(fatura.valor),
        status: fatura.status,
        metodo_pagamento: fatura.metodo_pagamento,
        data_vencimento: fatura.data_vencimento,
        data_pagamento: fatura.data_pagamento,
        data_criacao: fatura.data_criacao,
        invoice_url: fatura.invoice_url,
        assinatura: fatura.assinatura
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar faturas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar fatura específica
router.get('/:id', auth, async (req, res) => {
  try {
    const fatura = await prisma.pagamento.findFirst({
      where: {
        id: req.params.id,
        assinatura: {
          profissional_id: req.profissional.id
        }
      },
      include: {
        assinatura: {
          include: {
            plano: true
          }
        }
      }
    });

    if (!fatura) {
      return res.status(404).json({ message: 'Fatura não encontrada' });
    }

    res.json({
      id: fatura.id,
      asaas_payment_id: fatura.asaas_payment_id,
      valor: parseFloat(fatura.valor),
      status: fatura.status,
      metodo_pagamento: fatura.metodo_pagamento,
      data_vencimento: fatura.data_vencimento,
      data_pagamento: fatura.data_pagamento,
      data_criacao: fatura.data_criacao,
      invoice_url: fatura.invoice_url,
      assinatura: fatura.assinatura
    });
  } catch (error) {
    console.error('Erro ao buscar fatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ===== ROTAS PARA ADMINISTRADORES =====

// Listar todas as faturas (admin)
router.get('/admin/todas', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, profissional_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (profissional_id) {
      where.assinatura = {
        profissional_id: profissional_id
      };
    }

    const [faturas, total] = await Promise.all([
      prisma.pagamento.findMany({
        where,
        include: {
          assinatura: {
            include: {
              profissional: {
                select: {
                  id: true,
                  nome: true,
                  email: true
                }
              },
              plano: {
                select: {
                  id: true,
                  nome: true
                }
              }
            }
          }
        },
        orderBy: {
          data_criacao: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.pagamento.count({ where })
    ]);

    res.json({
      faturas: faturas.map(fatura => ({
        id: fatura.id,
        asaas_payment_id: fatura.asaas_payment_id,
        valor: parseFloat(fatura.valor),
        status: fatura.status,
        metodo_pagamento: fatura.metodo_pagamento,
        data_vencimento: fatura.data_vencimento,
        data_pagamento: fatura.data_pagamento,
        data_criacao: fatura.data_criacao,
        invoice_url: fatura.invoice_url,
        assinatura: fatura.assinatura
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar faturas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Estatísticas de faturas (admin)
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalFaturas,
      faturasPendentes,
      faturasPagas,
      faturasVencidas,
      receitaTotal,
      receitaMesAtual,
      faturasPorStatus,
      faturasPorMetodo
    ] = await Promise.all([
      prisma.pagamento.count(),
      prisma.pagamento.count({ where: { status: 'PENDENTE' } }),
      prisma.pagamento.count({ where: { status: 'CONFIRMADO' } }),
      prisma.pagamento.count({ where: { status: 'VENCIDO' } }),
      prisma.pagamento.aggregate({
        where: { status: 'CONFIRMADO' },
        _sum: { valor: true }
      }).then(result => result._sum.valor || 0),
      prisma.pagamento.aggregate({
        where: {
          status: 'CONFIRMADO',
          data_pagamento: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { valor: true }
      }).then(result => result._sum.valor || 0),
      prisma.pagamento.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.pagamento.groupBy({
        by: ['metodo_pagamento'],
        _count: { id: true },
        where: { status: 'CONFIRMADO' }
      })
    ]);

    res.json({
      totalFaturas,
      faturasPendentes,
      faturasPagas,
      faturasVencidas,
      receitaTotal: parseFloat(receitaTotal),
      receitaMesAtual: parseFloat(receitaMesAtual),
      faturasPorStatus: faturasPorStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {}),
      faturasPorMetodo: faturasPorMetodo.reduce((acc, item) => {
        acc[item.metodo_pagamento] = item._count.id;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de faturas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar fatura específica (admin)
router.get('/admin/:id', adminAuth, async (req, res) => {
  try {
    const fatura = await prisma.pagamento.findUnique({
      where: { id: req.params.id },
      include: {
        assinatura: {
          include: {
            profissional: {
              select: {
                id: true,
                nome: true,
                email: true,
                contato: true
              }
            },
            plano: true
          }
        }
      }
    });

    if (!fatura) {
      return res.status(404).json({ message: 'Fatura não encontrada' });
    }

    res.json({
      id: fatura.id,
      asaas_payment_id: fatura.asaas_payment_id,
      valor: parseFloat(fatura.valor),
      status: fatura.status,
      metodo_pagamento: fatura.metodo_pagamento,
      data_vencimento: fatura.data_vencimento,
      data_pagamento: fatura.data_pagamento,
      data_criacao: fatura.data_criacao,
      invoice_url: fatura.invoice_url,
      assinatura: fatura.assinatura
    });
  } catch (error) {
    console.error('Erro ao buscar fatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar status da fatura (admin)
router.put('/admin/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['PENDENTE', 'CONFIRMADO', 'VENCIDO', 'CANCELADO', 'ESTORNADO'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status inválido' 
      });
    }

    const fatura = await prisma.pagamento.update({
      where: { id: req.params.id },
      data: {
        status,
        data_pagamento: status === 'CONFIRMADO' ? new Date() : null
      }
    });

    res.json({
      message: 'Status da fatura atualizado com sucesso',
      fatura: {
        id: fatura.id,
        status: fatura.status,
        data_pagamento: fatura.data_pagamento
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar status da fatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
