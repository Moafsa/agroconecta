const express = require('express');
const { PrismaClient } = require('@prisma/client');
const adminAuth = require('../middleware/admin-auth');

const router = express.Router();
const prisma = new PrismaClient();

// Listar todos os planos
router.get('/', adminAuth, async (req, res) => {
  try {
    const planos = await prisma.plano.findMany({
      include: {
        admin_criador: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        _count: {
          select: {
            assinaturas: true,
            assinaturas_cliente: true
          }
        }
      },
      orderBy: {
        data_criacao: 'desc'
      }
    });

    res.json(planos);
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar plano por ID
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const plano = await prisma.plano.findUnique({
      where: { id },
      include: {
        admin_criador: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        assinaturas: {
          include: {
            profissional: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        },
        assinaturas_cliente: {
          include: {
            cliente: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!plano) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    res.json(plano);
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar novo plano
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      nome,
      descricao,
      tipo_plano,
      categoria,
      valor,
      periodo,
      recursos,
      limite_consultas,
      limite_profissionais,
      ativo = true
    } = req.body;

    // Validações
    if (!nome || !descricao || !tipo_plano || !categoria || !valor || !periodo) {
      return res.status(400).json({ 
        message: 'Nome, descrição, tipo, categoria, valor e período são obrigatórios' 
      });
    }

    if (valor <= 0) {
      return res.status(400).json({ message: 'Valor deve ser maior que zero' });
    }

    // Criar plano
    const plano = await prisma.plano.create({
      data: {
        nome,
        descricao,
        tipo_plano,
        categoria,
        valor: parseFloat(valor),
        periodo,
        recursos: recursos || [],
        limite_consultas: limite_consultas ? parseInt(limite_consultas) : null,
        limite_profissionais: limite_profissionais ? parseInt(limite_profissionais) : null,
        ativo,
        admin_criador_id: req.admin.id
      },
      include: {
        admin_criador: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Plano criado com sucesso',
      plano
    });

  } catch (error) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar plano
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      descricao,
      tipo_plano,
      categoria,
      valor,
      periodo,
      recursos,
      limite_consultas,
      limite_profissionais,
      ativo
    } = req.body;

    // Verificar se plano existe
    const planoExistente = await prisma.plano.findUnique({
      where: { id }
    });

    if (!planoExistente) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    // Atualizar plano
    const plano = await prisma.plano.update({
      where: { id },
      data: {
        nome,
        descricao,
        tipo_plano,
        categoria,
        valor: valor ? parseFloat(valor) : undefined,
        periodo,
        recursos: recursos || undefined,
        limite_consultas: limite_consultas ? parseInt(limite_consultas) : undefined,
        limite_profissionais: limite_profissionais ? parseInt(limite_profissionais) : undefined,
        ativo,
        data_atualizacao: new Date()
      },
      include: {
        admin_criador: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Plano atualizado com sucesso',
      plano
    });

  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar plano
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se plano existe
    const plano = await prisma.plano.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assinaturas: true,
            assinaturas_cliente: true
          }
        }
      }
    });

    if (!plano) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    // Verificar se há assinaturas ativas
    if (plano._count.assinaturas > 0 || plano._count.assinaturas_cliente > 0) {
      return res.status(400).json({ 
        message: 'Não é possível deletar um plano que possui assinaturas ativas' 
      });
    }

    // Deletar plano
    await prisma.plano.delete({
      where: { id }
    });

    res.json({ message: 'Plano deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Ativar/Desativar plano
router.patch('/:id/toggle', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const plano = await prisma.plano.findUnique({
      where: { id }
    });

    if (!plano) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    const planoAtualizado = await prisma.plano.update({
      where: { id },
      data: {
        ativo: !plano.ativo,
        data_atualizacao: new Date()
      }
    });

    res.json({
      message: `Plano ${planoAtualizado.ativo ? 'ativado' : 'desativado'} com sucesso`,
      plano: planoAtualizado
    });

  } catch (error) {
    console.error('Erro ao alterar status do plano:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Estatísticas dos planos
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const [
      totalPlanos,
      planosAtivos,
      planosProfissionais,
      planosClientes,
      totalAssinaturas,
      receitaTotal
    ] = await Promise.all([
      prisma.plano.count(),
      prisma.plano.count({ where: { ativo: true } }),
      prisma.plano.count({ where: { categoria: 'PROFISSIONAL' } }),
      prisma.plano.count({ where: { categoria: 'CLIENTE' } }),
      prisma.assinatura.count({ where: { status: 'ATIVO' } }) +
      prisma.assinaturaCliente.count({ where: { status: 'ATIVO' } }),
      prisma.assinatura.aggregate({
        where: { status: 'ATIVO' },
        _sum: { valor: true }
      }).then(result => result._sum.valor || 0) +
      prisma.assinaturaCliente.aggregate({
        where: { status: 'ATIVO' },
        _sum: { valor: true }
      }).then(result => result._sum.valor || 0)
    ]);

    res.json({
      totalPlanos,
      planosAtivos,
      planosProfissionais,
      planosClientes,
      totalAssinaturas,
      receitaTotal: parseFloat(receitaTotal)
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
