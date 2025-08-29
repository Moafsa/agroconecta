const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Buscar perfil do profissional autenticado
router.get('/me', auth, async (req, res) => {
  try {
    const profissional = await prisma.profissional.findUnique({
      where: { id: req.profissional.id },
      include: {
        especialidades: {
          include: {
            especialidade: true
          }
        },
        agenda_disponibilidade: true,
        avaliacoes: {
          include: {
            produtor: true
          }
        },
        assinaturas: {
          where: { status: 'ATIVO' },
          orderBy: { data_criacao: 'desc' },
          take: 1
        }
      }
    });

    if (!profissional) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }

    // Calcular média de avaliações
    const mediaAvaliacoes = profissional.avaliacoes.length > 0
      ? profissional.avaliacoes.reduce((acc, av) => acc + av.nota, 0) / profissional.avaliacoes.length
      : 0;

    const profissionalData = {
      id: profissional.id,
      nome: profissional.nome,
      email: profissional.email,
      contato: profissional.contato,
      foto: profissional.foto,
      regiao_atuacao: profissional.regiao_atuacao,
      especialidades: profissional.especialidades.map(pe => pe.especialidade.nome),
      agenda_disponibilidade: profissional.agenda_disponibilidade.length > 0 
        ? profissional.agenda_disponibilidade[0].descricao || ''
        : '',
      mediaAvaliacoes: Math.round(mediaAvaliacoes * 10) / 10,
      totalAvaliacoes: profissional.avaliacoes.length,
      assinaturaAtiva: profissional.assinaturas[0] || null
    };
    
    res.json({ profissional: profissionalData });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar perfil do profissional autenticado
router.put('/me', auth, async (req, res) => {
  try {
    const { nome, contato, regiao_atuacao, foto, especialidades, agenda_disponibilidade } = req.body;
    
    console.log('Dados recebidos para atualização:', {
      nome, contato, regiao_atuacao, foto, especialidades, agenda_disponibilidade
    });

    // Atualizar dados básicos
    const profissionalAtualizado = await prisma.profissional.update({
      where: { id: req.profissional.id },
      data: {
        ...(nome && { nome }),
        ...(contato && { contato }),
        ...(regiao_atuacao && { regiao_atuacao }),
        ...(foto !== undefined && { foto })
      }
    });

    // Atualizar especialidades se fornecidas
    if (especialidades && Array.isArray(especialidades)) {
      console.log('Atualizando especialidades:', especialidades);
      
      // Remover especialidades existentes
      await prisma.profissionalEspecialidade.deleteMany({
        where: { profissional_id: req.profissional.id }
      });

      // Adicionar novas especialidades
      for (const nomeEsp of especialidades) {
        const especialidade = await prisma.especialidade.upsert({
          where: { nome: nomeEsp },
          update: {},
          create: { nome: nomeEsp }
        });

        await prisma.profissionalEspecialidade.create({
          data: {
            profissional_id: req.profissional.id,
            especialidade_id: especialidade.id
          }
        });
      }
      
      console.log('Especialidades atualizadas com sucesso');
    }

    // Atualizar agenda se fornecida
    if (agenda_disponibilidade && typeof agenda_disponibilidade === 'string' && agenda_disponibilidade.trim()) {
      console.log('Atualizando agenda_disponibilidade:', agenda_disponibilidade);
      
      // Remover agenda existente
      await prisma.agendaDisponibilidade.deleteMany({
        where: { profissional_id: req.profissional.id }
      });

      // Criar entradas para todos os dias da semana
      const diasSemana = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];
      
      for (const dia of diasSemana) {
        await prisma.agendaDisponibilidade.create({
          data: {
            profissional_id: req.profissional.id,
            dia_semana: dia,
            horario_inicio: '00:00',
            horario_fim: '23:59',
            ativo: true,
            descricao: agenda_disponibilidade
          }
        });
      }
      
      console.log('Agenda atualizada com sucesso');
    }

    res.json({ message: 'Perfil atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar todos os profissionais (público)
router.get('/', async (req, res) => {
  try {
    const { especialidade, regiao, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      status_assinatura: 'ATIVO'
    };

    // Filtro por especialidade
    if (especialidade) {
      where.especialidades = {
        some: {
          especialidade: {
            nome: {
              contains: especialidade,
              mode: 'insensitive'
            }
          }
        }
      };
    }

    // Filtro por região
    if (regiao) {
      where.regiao_atuacao = {
        contains: regiao,
        mode: 'insensitive'
      };
    }

    const profissionais = await prisma.profissional.findMany({
      where,
      include: {
        especialidades: {
          include: {
            especialidade: true
          }
        },
        avaliacoes: true
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { data_cadastro: 'desc' }
    });

    // Calcular estatísticas para cada profissional
    const profissionaisComStats = profissionais.map(prof => {
      const mediaAvaliacoes = prof.avaliacoes.length > 0
        ? prof.avaliacoes.reduce((acc, av) => acc + av.nota, 0) / prof.avaliacoes.length
        : 0;

      return {
        id: prof.id,
        nome: prof.nome,
        foto: prof.foto,
        regiao_atuacao: prof.regiao_atuacao,
        especialidades: prof.especialidades.map(pe => pe.especialidade.nome),
        mediaAvaliacoes: Math.round(mediaAvaliacoes * 10) / 10,
        totalAvaliacoes: prof.avaliacoes.length
      };
    });

    const total = await prisma.profissional.count({ where });

    res.json({
      profissionais: profissionaisComStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar profissionais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar profissional específico (público)
router.get('/:id', async (req, res) => {
  try {
    const profissional = await prisma.profissional.findUnique({
      where: { id: req.params.id },
      include: {
        especialidades: {
          include: {
            especialidade: true
          }
        },
        agenda_disponibilidade: {
          where: { ativo: true }
        },
        avaliacoes: {
          include: {
            produtor: true
          },
          orderBy: { data: 'desc' },
          take: 10
        }
      }
    });

    if (!profissional) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }

    // Calcular estatísticas
    const mediaAvaliacoes = profissional.avaliacoes.length > 0
      ? profissional.avaliacoes.reduce((acc, av) => acc + av.nota, 0) / profissional.avaliacoes.length
      : 0;

    res.json({
      id: profissional.id,
      nome: profissional.nome,
      foto: profissional.foto,
      contato: profissional.contato,
      regiao_atuacao: profissional.regiao_atuacao,
      especialidades: profissional.especialidades.map(pe => pe.especialidade.nome),
      agenda_disponibilidade: profissional.agenda_disponibilidade,
      mediaAvaliacoes: Math.round(mediaAvaliacoes * 10) / 10,
      totalAvaliacoes: profissional.avaliacoes.length,
      avaliacoes: profissional.avaliacoes.map(av => ({
        id: av.id,
        nota: av.nota,
        comentario: av.comentario,
        data: av.data,
        produtor: av.produtor.nome
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

