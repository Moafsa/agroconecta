const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();
const prisma = new PrismaClient();

// Login de admin
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar admin
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!admin || !admin.ativo) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, admin.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, tipo: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar dados do admin (sem senha)
    const adminData = {
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
      nivel_acesso: admin.nivel_acesso,
      ativo: admin.ativo
    };

    res.json({
      message: 'Login realizado com sucesso',
      admin: adminData,
      token
    });

  } catch (error) {
    console.error('Erro no login admin:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Registrar admin (apenas para desenvolvimento)
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, nivel_acesso = 'ADMIN' } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se admin já existe
    const adminExistente = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (adminExistente) {
      return res.status(400).json({ message: 'Admin já existe com este email' });
    }

    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Criar admin
    const admin = await prisma.admin.create({
      data: {
        nome,
        email: email.toLowerCase(),
        senha: senhaCriptografada,
        nivel_acesso
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel_acesso: true,
        ativo: true,
        data_cadastro: true
      }
    });

    res.status(201).json({
      message: 'Admin criado com sucesso',
      admin
    });

  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar token de admin
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel_acesso: true,
        ativo: true,
        pix_wallet: true, // <-- CORREÇÃO: Adicionado o campo pix_wallet
        data_cadastro: true
      }
    });

    if (!admin || !admin.ativo) {
      return res.status(401).json({ message: 'Admin não encontrado ou inativo' });
    }

    res.json({ admin });

  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Update admin profile
router.put('/profile', adminAuth, async (req, res) => {
  try {
    const { nome, email, pix_wallet } = req.body;
    const adminId = req.user.id;

    // --- Robust Validation ---
    const errors = {};
    if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
      errors.nome = 'Name is required and must be at least 2 characters long.';
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please provide a valid email address.';
    }
    // pix_wallet is optional, but if provided it cannot be just whitespace
    if (pix_wallet && typeof pix_wallet === 'string' && pix_wallet.trim().length === 0) {
      errors.pix_wallet = 'PIX key cannot be empty.';
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation error', errors });
    }

    const emailLowerCase = email.toLowerCase();

    // Check if email is already in use by another admin
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        email: emailLowerCase,
        id: { not: adminId }
      }
    });

    if (existingAdmin) {
      return res.status(400).json({ 
          message: 'Validation error', 
          errors: { email: 'This email is already in use by another account.' } 
      });
    }

    const dataToUpdate = {
        nome: nome.trim(),
        email: emailLowerCase,
        // If pix_wallet is an empty string or just whitespace, store it as null.
        // Otherwise, store the trimmed value.
        pix_wallet: (pix_wallet && pix_wallet.trim()) ? pix_wallet.trim() : null
    };

    // Update admin in DB
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: dataToUpdate,
      select: {
        id: true,
        nome: true,
        email: true,
        nivel_acesso: true,
        ativo: true,
        pix_wallet: true
      }
    });
    console.log('Admin profile updated successfully in database:', updatedAdmin);

    res.json({
      message: 'Profile updated successfully!',
      admin: updatedAdmin
    });

  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get admin profile
router.get('/profile', adminAuth, async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel_acesso: true,
        ativo: true,
        pix_wallet: true,
        data_cadastro: true,
        data_atualizacao: true
      }
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ admin });

  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout de admin
router.post('/logout', adminAuth, async (req, res) => {
  try {
    // Aqui podemos implementar a lógica para invalidar o token no futuro
    // Por exemplo, adicionar o token a uma lista de tokens inválidos em um banco de dados
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout admin:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
