const express = require('express');
const { PrismaClient } = require('@prisma/client');
const adminAuth = require('../middleware/admin-auth');
const bcrypt = require('bcrypt'); // Adicionado para criptografia de senha

const router = express.Router();
const prisma = new PrismaClient();

// Listar todos os clientes
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tipo } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {};
    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contato: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tipo) {
      where.tipo_cliente = tipo;
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        include: {
          assinaturas_cliente: {
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
              interacoes_cliente: true
            }
          }
        },
        orderBy: {
          data_cadastro: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.cliente.count({ where })
    ]);

    res.json({
      clientes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar cliente por ID
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        assinaturas_cliente: {
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
            pagamentos_cliente: {
              orderBy: {
                data_criacao: 'desc'
              }
            }
          },
          orderBy: {
            data_criacao: 'desc'
          }
        },
        interacoes_cliente: {
          include: {
            profissional: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          },
          orderBy: {
            data_interacao: 'desc'
          }
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar novo cliente
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      nome,
      email,
      contato,
      tipo_cliente = 'PRODUTOR',
      regiao
    } = req.body;

    // Validações
    if (!nome || !contato) {
      return res.status(400).json({ 
        message: 'Nome e contato são obrigatórios' 
      });
    }

    // Verificar se cliente já existe (por email se fornecido)
    if (email) {
      const clienteExistente = await prisma.cliente.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (clienteExistente) {
        return res.status(400).json({ message: 'Cliente já existe com este email' });
      }
    }

    // Criar cliente
    const cliente = await prisma.cliente.create({
      data: {
        nome,
        email: email ? email.toLowerCase() : null,
        contato,
        tipo_cliente,
        regiao
      }
    });

    res.status(201).json({
      message: 'Cliente criado com sucesso',
      cliente
    });

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar cliente
router.put('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { nome, email, contato, regiao, documento, senha } = req.body;

  try {
    const updateData = {
      nome,
      email,
      contato,
      regiao,
      documento,
    };

    // Se uma nova senha foi fornecida, criptografa e adiciona aos dados de atualização
    if (senha) {
      updateData.senha = await bcrypt.hash(senha, 10);
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
      data: updateData,
    });

    // Remover a senha do objeto de resposta por segurança
    const { senha: _, ...clienteSemSenha } = clienteAtualizado;

    res.json(clienteSemSenha);
  } catch (error) {
    console.error(`Erro ao atualizar cliente ${id}:`, error);
     if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ message: 'O email fornecido já está em uso.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar o cliente.' });
  }
});

// Estatísticas dos clientes
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const [
      totalClientes,
      clientesAtivos,
      clientesPorTipo,
      receitaClientes,
      clientesRecentes
    ] = await Promise.all([
      prisma.cliente.count(),
      prisma.cliente.count({ 
        where: { 
          assinaturas_cliente: {
            some: {
              status: 'ATIVO'
            }
          }
        } 
      }),
      prisma.cliente.groupBy({
        by: ['tipo_cliente'],
        _count: {
          id: true
        }
      }),
      prisma.assinaturaCliente.aggregate({
        where: { status: 'ATIVO' },
        _sum: { valor: true }
      }).then(result => result._sum.valor || 0),
      prisma.cliente.count({
        where: {
          data_cadastro: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
          }
        }
      })
    ]);

    res.json({
      totalClientes,
      clientesAtivos,
      clientesPorTipo: clientesPorTipo.reduce((acc, item) => {
        acc[item.tipo_cliente] = item._count.id;
        return acc;
      }, {}),
      receitaClientes: parseFloat(receitaClientes),
      clientesRecentes
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas dos clientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para buscar pagamentos de um cliente específico
router.get('/:id/pagamentos', adminAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const pagamentos = await prisma.pagamentoCliente.findMany({
            where: {
                assinatura_cliente: {
                    cliente_id: id,
                },
            },
            include: {
                assinatura_cliente: {
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
        console.error(`Erro ao buscar pagamentos do cliente ${id}:`, error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para deletar um cliente
router.delete('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    // É importante considerar o que fazer com registros relacionados.
    // A configuração `onDelete` no `schema.prisma` pode automatizar isso.
    // Por exemplo, deletar pagamentos e assinaturas associados ao cliente.
    
    // Primeiro, deletar pagamentos associados
    await prisma.pagamentoCliente.deleteMany({
      where: { assinatura_cliente: { cliente_id: id } },
    });

    // Depois, deletar assinaturas associadas
    await prisma.assinaturaCliente.deleteMany({
      where: { cliente_id: id },
    });
    
    // Finalmente, deletar o cliente
    await prisma.cliente.delete({
      where: { id },
    });

    res.status(204).send(); // Sucesso, sem conteúdo
  } catch (error) {
    console.error(`Erro ao deletar cliente ${id}:`, error);
    if (error.code === 'P2025') { // Código de erro do Prisma para "not found"
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
