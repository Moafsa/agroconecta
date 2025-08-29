const express = require('express');
const Interacao = require('../models/Interacao');

const router = express.Router();

// Criar nova interação (POST /api/interacoes) - Usado pelo n8n
router.post('/', async (req, res) => {
  try {
    const { produtor_id, mensagem_inicial, status, dor_cliente } = req.body;

    if (!produtor_id || !mensagem_inicial) {
      return res.status(400).json({ message: 'produtor_id e mensagem_inicial são obrigatórios' });
    }

    const novaInteracao = new Interacao({
      produtor_id,
      mensagem_inicial,
      status: status || 'em_andamento',
      dor_cliente: dor_cliente || ''
    });

    await novaInteracao.save();

    res.status(201).json({
      message: 'Interação registrada com sucesso',
      interacao: novaInteracao
    });
  } catch (error) {
    console.error('Erro ao criar interação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar interação (PUT /api/interacoes/:id) - Usado pelo n8n
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, profissional_id, historico_mensagens, dor_cliente } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (profissional_id) updateData.profissional_id = profissional_id;
    if (historico_mensagens) updateData.historico_mensagens = historico_mensagens;
    if (dor_cliente) updateData.dor_cliente = dor_cliente;

    const interacaoAtualizada = await Interacao.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('produtor_id', 'nome contato')
     .populate('profissional_id', 'nome email contato especialidades');

    if (!interacaoAtualizada) {
      return res.status(404).json({ message: 'Interação não encontrada' });
    }

    res.json({
      message: 'Interação atualizada com sucesso',
      interacao: interacaoAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar interação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar interação por ID (GET /api/interacoes/:id)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const interacao = await Interacao.findById(id)
      .populate('produtor_id', 'nome contato')
      .populate('profissional_id', 'nome email contato especialidades');
    
    if (!interacao) {
      return res.status(404).json({ message: 'Interação não encontrada' });
    }

    res.json({ interacao });
  } catch (error) {
    console.error('Erro ao buscar interação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar interações (GET /api/interacoes) - Para uso do n8n e dashboard
router.get('/', async (req, res) => {
  try {
    const { profissional_id, status, limit = 50 } = req.query;
    
    const filter = {};
    if (profissional_id) filter.profissional_id = profissional_id;
    if (status) filter.status = status;

    const interacoes = await Interacao.find(filter)
      .populate('produtor_id', 'nome contato')
      .populate('profissional_id', 'nome email contato especialidades')
      .sort({ data_interacao: -1 })
      .limit(parseInt(limit));

    res.json({ interacoes });
  } catch (error) {
    console.error('Erro ao listar interações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

