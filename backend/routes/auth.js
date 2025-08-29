const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Profissional = require('../models/Profissional');

const router = express.Router();

// Registro de profissional
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, contato, foto, especialidades, regiao_atuacao } = req.body;

    // Verificar se o profissional já existe
    const profissionalExistente = await Profissional.findOne({ email });
    if (profissionalExistente) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Criar novo profissional
    const novoProfissional = new Profissional({
      nome,
      email,
      senha: senhaHash,
      contato,
      foto: foto || '',
      especialidades: especialidades || [],
      regiao_atuacao
    });

    await novoProfissional.save();

    res.status(201).json({
      message: 'Profissional registrado com sucesso',
      profissional: {
        _id: novoProfissional._id,
        id: novoProfissional._id,
        email: novoProfissional.email,
        nome: novoProfissional.nome,
        contato: novoProfissional.contato,
        foto: novoProfissional.foto,
        especialidades: novoProfissional.especialidades,
        regiao_atuacao: novoProfissional.regiao_atuacao
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login de profissional
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se o profissional existe
    const profissional = await Profissional.findOne({ email });
    if (!profissional) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, profissional.senha);
    if (!senhaValida) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: profissional._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const profissionalData = {
      _id: profissional._id,
      id: profissional._id,
      email: profissional.email,
      nome: profissional.nome,
      contato: profissional.contato,
      foto: profissional.foto,
      especialidades: profissional.especialidades,
      regiao_atuacao: profissional.regiao_atuacao
    };
    
    console.log('Dados do profissional retornados no login:', profissionalData);
    
    res.json({
      token,
      profissional: profissionalData
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

