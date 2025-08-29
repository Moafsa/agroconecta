const express = require('express');
const { PrismaClient } = require('@prisma/client');
const adminAuth = require('../middleware/admin-auth');

const router = express.Router();
const prisma = new PrismaClient();

// Listar todos os profissionais
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, especialidade } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {};
    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contato: { contains: search, mode: 'insensitive' } },
        { regiao_atuacao: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (especialidade) {
      where.especialidades = {
        some: {
          especialidade: {
            nome: { contains: especialidade, mode: 'insensitive' }
          }
        }
      };
    }

    const [profissionais, total] = await Promise.all([
      prisma.profissional.findMany({
        where,
        include: {
          especialidades: {
            include: {
              especialidade: {
                select: {
                  id: true,
                  nome: true
                }
              }
            }
          },
          assinaturas: {
            include: {
              plano: {
                select: {
                  id: true,
                  nome: true,
                  valor: true
                }
              }
            },
            where: {
              status: 'ATIVO'
            }
          },
          _count: {
            select: {
              interacoes: true,
              interacoes_cliente: true,
              avaliacoes: true
            }
          }
        },
        orderBy: {
          data_cadastro: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.profissional.count({ where })
    ]);

    res.json({
      profissionais,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erro ao listar profissionais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar profissional por ID
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const profissional = await prisma.profissional.findUnique({
      where: { id },
      include: {
        especialidades: {
          include: {
            especialidade: {
              select: {
                id: true,
                nome: true,
                descricao: true
              }
            }
          }
        },
        assinaturas: {
          include: {
            plano: {
              select: {
                id: true,
                nome: true,
                descricao: true,
                valor: true,
                periodo: true
              }
            },
            pagamentos: {
              orderBy: {
                data_criacao: 'desc'
              }
            }
          },
          orderBy: {
            data_criacao: 'desc'
          }
        },
        interacoes: {
          include: {
            produtor: {
              select: {
                id: true,
                nome: true
              }
            }
          },
          orderBy: {
            data_interacao: 'desc'
          }
        },
        interacoes_cliente: {
          include: {
            cliente: {
              select: {
                id: true,
                nome: true
              }
            }
          },
          orderBy: {
            data_interacao: 'desc'
          }
        },
        avaliacoes: {
          include: {
            produtor: {
              select: {
                id: true,
                nome: true
              }
            }
          },
          orderBy: {
            data: 'desc'
          }
        }
      }
    });

    if (!profissional) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }

    res.json(profissional);
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar profissional
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      email,
      contato,
      regiao_atuacao,
      status_assinatura,
      comissao_plataforma,
      ativo = true
    } = req.body;

    // Verificar se profissional existe
    const profissionalExistente = await prisma.profissional.findUnique({
      where: { id }
    });

    if (!profissionalExistente) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }

    // Verificar se email já existe (se foi alterado)
    if (email && email !== profissionalExistente.email) {
      const emailExistente = await prisma.profissional.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (emailExistente) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }
    }

    // Validar comissão se fornecida
    if (comissao_plataforma !== undefined && (comissao_plataforma < 0 || comissao_plataforma > 100)) {
      return res.status(400).json({ 
        message: 'Comissão deve estar entre 0 e 100%' 
      });
    }

    // Atualizar profissional
    const profissional = await prisma.profissional.update({
      where: { id },
      data: {
        nome,
        email: email ? email.toLowerCase() : undefined,
        contato,
        regiao_atuacao,
        status_assinatura,
        comissao_plataforma: comissao_plataforma !== undefined ? parseFloat(comissao_plataforma) : undefined,
        data_atualizacao: new Date()
      }
    });

    res.json({
      message: 'Profissional atualizado com sucesso',
      profissional
    });

  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar profissional
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se profissional existe
    const profissional = await prisma.profissional.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assinaturas: true,
            interacoes: true,
            interacoes_cliente: true,
            avaliacoes: true
          }
        }
      }
    });

    if (!profissional) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }

    // Verificar se há assinaturas ativas
    if (profissional._count.assinaturas > 0) {
      return res.status(400).json({ 
        message: 'Não é possível deletar um profissional que possui assinaturas ativas' 
      });
    }

    // Deletar profissional
    await prisma.profissional.delete({
      where: { id }
    });

    res.json({ message: 'Profissional deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar profissional:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Estatísticas dos profissionais
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const [
      totalProfissionais,
      profissionaisAtivos,
      profissionaisPorRegiao,
      receitaProfissionais,
      profissionaisRecentes,
      mediaAvaliacao
    ] = await Promise.all([
      prisma.profissional.count(),
      prisma.profissional.count({ 
        where: { 
          assinaturas: {
            some: {
              status: 'ATIVO'
            }
          }
        } 
      }),
      prisma.profissional.groupBy({
        by: ['regiao_atuacao'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 5
      }),
      prisma.assinatura.aggregate({
        where: { status: 'ATIVO' },
        _sum: { valor: true }
      }).then(result => result._sum.valor || 0),
      prisma.profissional.count({
        where: {
          data_cadastro: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
          }
        }
      }),
      prisma.avaliacao.aggregate({
        _avg: {
          nota: true
        }
      }).then(result => result._avg.nota || 0)
    ]);

    res.json({
      totalProfissionais,
      profissionaisAtivos,
      profissionaisPorRegiao: profissionaisPorRegiao.reduce((acc, item) => {
        acc[item.regiao_atuacao] = item._count.id;
        return acc;
      }, {}),
      receitaProfissionais: parseFloat(receitaProfissionais),
      profissionaisRecentes,
      mediaAvaliacao: parseFloat(mediaAvaliacao)
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas dos profissionais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para buscar pagamentos de um profissional específico
router.get('/:id/pagamentos', adminAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const pagamentos = await prisma.pagamento.findMany({
            where: {
                assinatura: {
                    profissional_id: id,
                },
            },
            include: {
                assinatura: {
                    include: {
                        plano: true,
                    },
                },
            },
            orderBy: {
                data_criacao: 'desc',
            },
        });
        res.json(pagamentos);
    } catch (error) {
        console.error(`Erro ao buscar pagamentos do profissional ${id}:`, error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

module.exports = router;
