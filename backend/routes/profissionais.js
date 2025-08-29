const express = require('express');
const Profissional = require('../models/Profissional');
const auth = require('../middleware/auth');

const router = express.Router();

// Buscar perfil do profissional autenticado (GET /api/profissionais/me)
router.get('/me', auth, async (req, res) => {
  try {
    const profissional = await Profissional.findById(req.profissional._id).select('-senha');
    res.json({ profissional });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar perfil do profissional autenticado (PUT /api/profissionais/me)
router.put('/me', auth, async (req, res) => {
  try {
    const { foto, especialidades, regiao_atuacao, agenda_disponibilidade } = req.body;
    
    const profissionalAtualizado = await Profissional.findByIdAndUpdate(
      req.profissional._id,
      {
        ...(foto !== undefined && { foto }),
        ...(especialidades && { especialidades }),
        ...(regiao_atuacao && { regiao_atuacao }),
        ...(agenda_disponibilidade && { agenda_disponibilidade })
      },
      { new: true, runValidators: true }
    ).select('-senha');

    if (!profissionalAtualizado) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }

    res.json({
      message: 'Perfil atualizado com sucesso',
      profissional: profissionalAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar perfil de profissional (POST /api/profissionais)
router.post('/', auth, async (req, res) => {
  try {
    const { nome, contato, foto, especialidades, regiao_atuacao, agenda_disponibilidade } = req.body;
    
    // Atualizar o profissional autenticado
    const profissionalAtualizado = await Profissional.findByIdAndUpdate(
      req.profissional._id,
      {
        nome: nome || req.profissional.nome,
        contato: contato || req.profissional.contato,
        foto: foto || req.profissional.foto,
        especialidades: especialidades || req.profissional.especialidades,
        regiao_atuacao: regiao_atuacao || req.profissional.regiao_atuacao,
        agenda_disponibilidade: agenda_disponibilidade || req.profissional.agenda_disponibilidade
      },
      { new: true, runValidators: true }
    ).select('-senha');

    res.json({
      message: 'Perfil criado/atualizado com sucesso',
      profissional: profissionalAtualizado
    });
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar perfil de profissional (PUT /api/profissionais/:id)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o profissional está tentando atualizar seu próprio perfil
    if (id !== req.profissional._id.toString()) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const { nome, contato, foto, especialidades, regiao_atuacao, agenda_disponibilidade } = req.body;
    
    const profissionalAtualizado = await Profissional.findByIdAndUpdate(
      id,
      {
        ...(nome && { nome }),
        ...(contato && { contato }),
        ...(foto !== undefined && { foto }),
        ...(especialidades && { especialidades }),
        ...(regiao_atuacao && { regiao_atuacao }),
        ...(agenda_disponibilidade && { agenda_disponibilidade })
      },
      { new: true, runValidators: true }
    ).select('-senha');

    if (!profissionalAtualizado) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }

    res.json({
      message: 'Perfil atualizado com sucesso',
      profissional: profissionalAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar perfil de profissional (GET /api/profissionais/:id)
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o profissional está tentando acessar seu próprio perfil
    if (id !== req.profissional._id.toString()) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const profissional = await Profissional.findById(id).select('-senha');
    
    if (!profissional) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }

    res.json({ profissional });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

