const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin-auth');

const router = express.Router();

// ===== ROTAS PARA PROFISSIONAIS =====

// Buscar status de verificação do profissional autenticado
router.get('/me', auth, async (req, res) => {
  try {
    const profissional = await prisma.profissional.findUnique({
      where: { id: req.profissional.id },
      include: {
        documentos_verificados: {
          orderBy: { data_upload: 'desc' }
        },
        certificacoes: {
          orderBy: { data_upload: 'desc' }
        },
        admin_verificador: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    if (!profissional) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }

    res.json({
      status_verificacao: profissional.status_verificacao,
      nivel_verificacao: profissional.nivel_verificacao,
      data_verificacao: profissional.data_verificacao,
      admin_verificador: profissional.admin_verificador,
      documentos: profissional.documentos_verificados,
      certificacoes: profissional.certificacoes
    });
  } catch (error) {
    console.error('Erro ao buscar status de verificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Upload de documento para verificação
router.post('/documentos', auth, async (req, res) => {
  try {
    const { tipo_documento, numero_documento, arquivo_url } = req.body;

    if (!tipo_documento || !numero_documento) {
      return res.status(400).json({ 
        message: 'Tipo e número do documento são obrigatórios' 
      });
    }

    // Verificar se já existe documento do mesmo tipo
    const documentoExistente = await prisma.documentoVerificacao.findFirst({
      where: {
        profissional_id: req.profissional.id,
        tipo_documento: tipo_documento
      }
    });

    if (documentoExistente) {
      return res.status(400).json({ 
        message: 'Já existe um documento deste tipo enviado' 
      });
    }

    const documento = await prisma.documentoVerificacao.create({
      data: {
        profissional_id: req.profissional.id,
        tipo_documento,
        numero_documento,
        arquivo_url: arquivo_url || null
      }
    });

    res.json({
      message: 'Documento enviado para verificação com sucesso',
      documento
    });
  } catch (error) {
    console.error('Erro ao enviar documento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Upload de certificação
router.post('/certificacoes', auth, async (req, res) => {
  try {
    const { 
      nome, 
      instituicao, 
      numero_certificado, 
      data_emissao, 
      data_validade, 
      arquivo_url 
    } = req.body;

    if (!nome || !instituicao || !data_emissao) {
      return res.status(400).json({ 
        message: 'Nome, instituição e data de emissão são obrigatórios' 
      });
    }

    const certificacao = await prisma.certificacao.create({
      data: {
        profissional_id: req.profissional.id,
        nome,
        instituicao,
        numero_certificado: numero_certificado || null,
        data_emissao: new Date(data_emissao),
        data_validade: data_validade ? new Date(data_validade) : null,
        arquivo_url: arquivo_url || null
      }
    });

    res.json({
      message: 'Certificação enviada para verificação com sucesso',
      certificacao
    });
  } catch (error) {
    console.error('Erro ao enviar certificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ===== ROTAS PARA ADMINISTRADORES =====

// Listar profissionais pendentes de verificação
router.get('/pendentes', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const profissionais = await prisma.profissional.findMany({
      where: {
        status_verificacao: 'PENDENTE'
      },
      include: {
        documentos_verificados: {
          where: { status: 'PENDENTE' }
        },
        certificacoes: {
          where: { status: 'PENDENTE' }
        },
        especialidades: {
          include: {
            especialidade: true
          }
        }
      },
      orderBy: { data_cadastro: 'asc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.profissional.count({
      where: { status_verificacao: 'PENDENTE' }
    });

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
    console.error('Erro ao listar profissionais pendentes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar documento
router.put('/documentos/:id/verificar', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacoes } = req.body;

    if (!['VERIFICADO', 'REJEITADO'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status deve ser VERIFICADO ou REJEITADO' 
      });
    }

    const documento = await prisma.documentoVerificacao.update({
      where: { id },
      data: {
        status,
        observacoes,
        data_verificacao: new Date(),
        admin_verificador_id: req.admin.id
      }
    });

    res.json({
      message: 'Documento verificado com sucesso',
      documento
    });
  } catch (error) {
    console.error('Erro ao verificar documento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar certificação
router.put('/certificacoes/:id/verificar', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observacoes } = req.body;

    if (!['VERIFICADO', 'REJEITADO'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status deve ser VERIFICADO ou REJEITADO' 
      });
    }

    const certificacao = await prisma.certificacao.update({
      where: { id },
      data: {
        status,
        observacoes,
        data_verificacao: new Date(),
        admin_verificador_id: req.admin.id
      }
    });

    res.json({
      message: 'Certificação verificada com sucesso',
      certificacao
    });
  } catch (error) {
    console.error('Erro ao verificar certificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar status de verificação do profissional
router.put('/profissionais/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status_verificacao, nivel_verificacao, observacoes } = req.body;

    if (!['PENDENTE', 'EM_ANALISE', 'VERIFICADO', 'REJEITADO'].includes(status_verificacao)) {
      return res.status(400).json({ 
        message: 'Status de verificação inválido' 
      });
    }

    const profissional = await prisma.profissional.update({
      where: { id },
      data: {
        status_verificacao,
        nivel_verificacao: nivel_verificacao || undefined,
        data_verificacao: status_verificacao === 'VERIFICADO' ? new Date() : null,
        admin_verificador_id: req.admin.id
      }
    });

    // Se foi verificado, atualizar status de assinatura para ATIVO se estava PENDENTE
    if (status_verificacao === 'VERIFICADO' && profissional.status_assinatura === 'PENDENTE') {
      await prisma.profissional.update({
        where: { id },
        data: { status_assinatura: 'ATIVO' }
      });
    }

    res.json({
      message: 'Status de verificação atualizado com sucesso',
      profissional
    });
  } catch (error) {
    console.error('Erro ao atualizar status de verificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Estatísticas de verificação
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalPendentes,
      totalVerificados,
      totalRejeitados,
      documentosPendentes,
      certificacoesPendentes,
      verificacoesPorNivel
    ] = await Promise.all([
      prisma.profissional.count({ where: { status_verificacao: 'PENDENTE' } }),
      prisma.profissional.count({ where: { status_verificacao: 'VERIFICADO' } }),
      prisma.profissional.count({ where: { status_verificacao: 'REJEITADO' } }),
      prisma.documentoVerificacao.count({ where: { status: 'PENDENTE' } }),
      prisma.certificacao.count({ where: { status: 'PENDENTE' } }),
      prisma.profissional.groupBy({
        by: ['nivel_verificacao'],
        _count: { id: true },
        where: { status_verificacao: 'VERIFICADO' }
      })
    ]);

    res.json({
      totalPendentes,
      totalVerificados,
      totalRejeitados,
      documentosPendentes,
      certificacoesPendentes,
      verificacoesPorNivel: verificacoesPorNivel.reduce((acc, item) => {
        acc[item.nivel_verificacao] = item._count.id;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de verificação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
