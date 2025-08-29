const express = require('express');
const Produtor = require('../models/Produtor');

const router = express.Router();

// Criar novo produtor (POST /api/produtores)
router.post('/', async (req, res) => {
  try {
    const { nome, contato } = req.body;

    if (!nome || !contato) {
      return res.status(400).json({ message: 'Nome e contato são obrigatórios' });
    }

    const novoProdutor = new Produtor({
      nome,
      contato
    });

    await novoProdutor.save();

    res.status(201).json({
      message: 'Produtor criado com sucesso',
      produtor: novoProdutor
    });
  } catch (error) {
    console.error('Erro ao criar produtor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar produtor por ID (GET /api/produtores/:id)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const produtor = await Produtor.findById(id);
    
    if (!produtor) {
      return res.status(404).json({ message: 'Produtor não encontrado' });
    }

    res.json({ produtor });
  } catch (error) {
    console.error('Erro ao buscar produtor:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar todos os produtores (GET /api/produtores) - Para uso do n8n
router.get('/', async (req, res) => {
  try {
    const produtores = await Produtor.find().sort({ data_cadastro: -1 });
    res.json({ produtores });
  } catch (error) {
    console.error('Erro ao listar produtores:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

