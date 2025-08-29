const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Criar nova interação (público - vem do chat)
router.post('/', async (req, res) => {
  try {
    const { produtor_nome, produtor_contato, produtor_email, mensagem_inicial, dor_cliente } = req.body;

    // Criar ou buscar produtor
    let produtor = await prisma.produtor.findFirst({
      where: {
        OR: [
          { contato: produtor_contato },
          { email: produtor_email }
        ]
      }
    });

    if (!produtor) {
      produtor = await prisma.produtor.create({
        data: {
          nome: produtor_nome,
          contato: produtor_contato,
          email: produtor_email
        }
      });
    }

    // Criar interação
    const interacao = await prisma.interacao.create({
      data: {
        produtor_id: produtor.id,
        mensagem_inicial,
        dor_cliente,
        status: 'EM_ANDAMENTO',
        historico_mensagens: {
          create: {
            remetente: 'PRODUTOR',
            mensagem: mensagem_inicial
          }
        }
      },
      include: {
        produtor: true,
        historico_mensagens: true
      }
    });

    res.status(201).json({
      message: 'Interação criada com sucesso',
      interacao
    });
  } catch (error) {
    console.error('Erro ao criar interação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar interações (com filtros opcionais)
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    const userType = req.userType;
    const userId = req.user.id;

    // Filtrar por tipo de usuário
    if (userType === 'profissional') {
      where.profissional_id = userId;
    } else if (userType === 'cliente') {
      // Um cliente/produtor deve ter seu ID correspondente na tabela de produtor
      // Esta lógica assume que o ID do cliente corresponde ao ID do produtor
      where.produtor_id = userId;
    } else {
      // Se não for nenhum dos tipos esperados, não retorna nada
      return res.json({ interacoes: [], pagination: { total: 0 } });
    }

    if (status) {
      where.status = status;
    }

    const interacoes = await prisma.interacao.findMany({
      where,
      include: {
        produtor: true,
        historico_mensagens: {
          orderBy: { timestamp: 'asc' }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { data_interacao: 'desc' }
    });

    const total = await prisma.interacao.count({ where });

    res.json({
      interacoes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar interações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar interações do profissional autenticado
router.get('/minhas', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      profissional_id: req.profissional.id
    };

    if (status) {
      where.status = status;
    }

    const interacoes = await prisma.interacao.findMany({
      where,
      include: {
        produtor: true,
        historico_mensagens: {
          orderBy: { timestamp: 'asc' }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { data_interacao: 'desc' }
    });

    const total = await prisma.interacao.count({ where });

    res.json({
      interacoes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar interações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar interação específica
router.get('/:id', auth, async (req, res) => {
  try {
    const interacao = await prisma.interacao.findUnique({
      where: { id: req.params.id },
      include: {
        produtor: true,
        profissional: true,
        historico_mensagens: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!interacao) {
      return res.status(404).json({ message: 'Interação não encontrada' });
    }

    // Verificar se o profissional tem acesso a esta interação
    if (interacao.profissional_id && interacao.profissional_id !== req.profissional.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json(interacao);
  } catch (error) {
    console.error('Erro ao buscar interação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar interação (atribuir profissional, alterar status)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, profissional_id } = req.body;

    const interacao = await prisma.interacao.findUnique({
      where: { id: req.params.id }
    });

    if (!interacao) {
      return res.status(404).json({ message: 'Interação não encontrada' });
    }

    // Verificar permissões
    if (interacao.profissional_id && interacao.profissional_id !== req.profissional.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const dadosAtualizacao = {};

    if (status) {
      dadosAtualizacao.status = status;
    }

    if (profissional_id) {
      dadosAtualizacao.profissional_id = profissional_id;
    }

    const interacaoAtualizada = await prisma.interacao.update({
      where: { id: req.params.id },
      data: dadosAtualizacao,
      include: {
        produtor: true,
        profissional: true,
        historico_mensagens: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    res.json({
      message: 'Interação atualizada com sucesso',
      interacao: interacaoAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar interação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Adicionar mensagem ao histórico
router.post('/:id/mensagens', auth, async (req, res) => {
  try {
    const { mensagem } = req.body;

    const interacao = await prisma.interacao.findUnique({
      where: { id: req.params.id }
    });

    if (!interacao) {
      return res.status(404).json({ message: 'Interação não encontrada' });
    }

    // Verificar se o profissional tem acesso
    if (interacao.profissional_id !== req.profissional.id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const novaMensagem = await prisma.historicoMensagem.create({
      data: {
        interacao_id: req.params.id,
        remetente: 'PROFISSIONAL',
        mensagem
      }
    });

    res.status(201).json({
      message: 'Mensagem adicionada com sucesso',
      mensagem: novaMensagem
    });
  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar interações não atribuídas (para distribuição)
router.get('/nao-atribuidas', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const interacoes = await prisma.interacao.findMany({
      where: {
        profissional_id: null,
        status: 'EM_ANDAMENTO'
      },
      include: {
        produtor: true,
        historico_mensagens: {
          take: 1,
          orderBy: { timestamp: 'desc' }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { data_interacao: 'asc' }
    });

    const total = await prisma.interacao.count({
      where: {
        profissional_id: null,
        status: 'EM_ANDAMENTO'
      }
    });

    res.json({
      interacoes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar interações não atribuídas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

