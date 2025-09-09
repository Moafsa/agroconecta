const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');
const { mapAsaasStatus, mapAsaasBillingType } = require('../lib/asaas');

const router = express.Router();

// Middleware de log para debug
router.use((req, res, next) => {
  console.log(`🔍 [FATURAS] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ===== ROTAS PARA PROFISSIONAIS =====

// Rota de teste para verificar se a rota está funcionando
router.get('/teste', (req, res) => {
  res.json({ 
    message: 'Rota de faturas funcionando!', 
    timestamp: new Date().toISOString(),
    path: req.path 
  });
});

// Buscar faturas do profissional autenticado
router.get('/minhas', auth, async (req, res) => {
  try {
    console.log('🔍 [FATURAS] Buscando faturas para profissional:', req.profissional?.id);
    
    // Buscar faturas tanto de assinaturas profissionais quanto de clientes
    const faturasProfissional = await prisma.pagamento.findMany({
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

    // Buscar faturas de assinaturas de cliente (se o profissional também for cliente)
    const faturasCliente = await prisma.pagamentoCliente.findMany({
      where: {
        assinatura_cliente: {
          cliente_id: req.profissional.id
        }
      },
      include: {
        assinatura_cliente: {
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

    // Combinar e formatar todas as faturas
    const todasFaturas = [
      ...faturasProfissional.map(fatura => ({
        id: fatura.id,
        asaas_payment_id: fatura.asaas_payment_id,
        valor: parseFloat(fatura.valor),
        status: fatura.status,
        metodo_pagamento: fatura.metodo_pagamento,
        data_vencimento: fatura.data_vencimento,
        data_pagamento: fatura.data_pagamento,
        data_criacao: fatura.data_criacao,
        invoice_url: fatura.invoice_url,
        assinatura: fatura.assinatura,
        tipo: 'profissional'
      })),
      ...faturasCliente.map(fatura => ({
        id: fatura.id,
        asaas_payment_id: fatura.asaas_payment_id,
        valor: parseFloat(fatura.valor),
        status: fatura.status,
        metodo_pagamento: fatura.metodo_pagamento,
        data_vencimento: fatura.data_vencimento,
        data_pagamento: fatura.data_pagamento,
        data_criacao: fatura.data_criacao,
        invoice_url: fatura.invoice_url,
        assinatura: fatura.assinatura_cliente,
        tipo: 'cliente'
      }))
    ].sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));

    console.log('Faturas encontradas:', todasFaturas.length);

    res.json({
      faturas: todasFaturas
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
    const { status, sincronizar_asaas = false } = req.body;

    if (!['PENDENTE', 'CONFIRMADO', 'VENCIDO', 'CANCELADO', 'ESTORNADO'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status inválido' 
      });
    }

    // Buscar a fatura com dados da assinatura
    const fatura = await prisma.pagamento.findUnique({
      where: { id: req.params.id },
      include: {
        assinatura: {
          include: {
            profissional: true
          }
        }
      }
    });

    if (!fatura) {
      return res.status(404).json({ message: 'Fatura não encontrada' });
    }

    // Atualizar status local
    const faturaAtualizada = await prisma.pagamento.update({
      where: { id: req.params.id },
      data: {
        status,
        data_pagamento: status === 'CONFIRMADO' ? new Date() : null
      }
    });

    // Se for confirmação de pagamento, ativar assinatura
    if (status === 'CONFIRMADO') {
      await prisma.assinatura.update({
        where: { id: fatura.assinatura_id },
        data: { status: 'ATIVO' }
      });

      await prisma.profissional.update({
        where: { id: fatura.assinatura.profissional_id },
        data: { status_assinatura: 'ATIVO' }
      });

      console.log('✅ Assinatura ativada após confirmação de pagamento:', fatura.assinatura_id);
    }

    // Sincronizar com Asaas se solicitado
    if (sincronizar_asaas && fatura.asaas_payment_id) {
      try {
        const { getPayment } = require('../lib/asaas');
        const asaasPayment = await getPayment(fatura.asaas_payment_id);
        
        console.log('📋 Status atual no Asaas:', asaasPayment.status);
        
        // Aqui você pode implementar lógica para atualizar o status no Asaas
        // se a API do Asaas permitir
        
        console.log('🔄 Sincronização com Asaas realizada');
      } catch (asaasError) {
        console.error('⚠️ Erro ao sincronizar com Asaas:', asaasError.message);
      }
    }

    res.json({
      message: 'Status da fatura atualizado com sucesso',
      fatura: {
        id: faturaAtualizada.id,
        status: faturaAtualizada.status,
        data_pagamento: faturaAtualizada.data_pagamento
      },
      assinatura_ativada: status === 'CONFIRMADO'
    });
  } catch (error) {
    console.error('Erro ao atualizar status da fatura:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para sincronizar faturas com o Asaas (útil para debug)
router.post('/sincronizar', auth, async (req, res) => {
  try {
    const { getSubscriptionPayments } = require('../lib/asaas');
    
    // Buscar todas as assinaturas do profissional
    const assinaturas = await prisma.assinatura.findMany({
      where: { profissional_id: req.profissional.id },
      include: { pagamentos: true }
    });

    let faturasSincronizadas = 0;
    let erros = [];

    for (const assinatura of assinaturas) {
      try {
        console.log(`Sincronizando assinatura: ${assinatura.asaas_subscription_id}`);
        
        // Buscar pagamentos no Asaas
        const asaasPayments = await getSubscriptionPayments(assinatura.asaas_subscription_id);
        
        if (asaasPayments && asaasPayments.data) {
          for (const asaasPayment of asaasPayments.data) {
            // Verificar se o pagamento já existe
            const pagamentoExistente = await prisma.pagamento.findFirst({
              where: { asaas_payment_id: asaasPayment.id }
            });

            if (!pagamentoExistente) {
              // Criar novo pagamento
              await prisma.pagamento.create({
                data: {
                  assinatura_id: assinatura.id,
                  asaas_payment_id: asaasPayment.id,
                  invoice_url: asaasPayment.invoiceUrl,
                  valor: parseFloat(asaasPayment.value),
                  status: mapAsaasStatus(asaasPayment.status),
                  metodo_pagamento: mapAsaasBillingType(asaasPayment.billingType),
                  data_vencimento: new Date(asaasPayment.dueDate),
                  data_pagamento: asaasPayment.paymentDate ? new Date(asaasPayment.paymentDate) : null
                }
              });
              
              faturasSincronizadas++;
              console.log(`✅ Fatura sincronizada: ${asaasPayment.id}`);
            }
          }
        }
      } catch (error) {
        console.error(`Erro ao sincronizar assinatura ${assinatura.asaas_subscription_id}:`, error);
        erros.push({
          assinatura_id: assinatura.asaas_subscription_id,
          erro: error.message
        });
      }
    }

    res.json({
      message: 'Sincronização concluída',
      faturas_sincronizadas: faturasSincronizadas,
      erros: erros
    });

  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
