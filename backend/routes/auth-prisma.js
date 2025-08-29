const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const router = express.Router();

// Registro de profissional
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, contato, regiao_atuacao, especialidades, cpf_cnpj } = req.body;

    // Verificar se o email já existe
    const profissionalExistente = await prisma.profissional.findUnique({
      where: { email }
    });

    if (profissionalExistente) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Verificar se o CPF/CNPJ já existe
    if (cpf_cnpj) {
       const cpfExistente = await prisma.profissional.findUnique({
           where: { cpf_cnpj },
       });
       if (cpfExistente) {
           return res.status(400).json({ message: 'CPF/CNPJ já está em uso' });
       }
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Criar novo profissional
    const novoProfissional = await prisma.profissional.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        contato,
        regiao_atuacao,
        cpf_cnpj, // <-- CORREÇÃO: Adicionado o campo
        especialidades: {
          create: especialidades?.map(esp => ({
            especialidade: {
              connectOrCreate: {
                where: { nome: esp },
                create: { nome: esp }
              }
            }
          })) || []
        }
      },
      include: {
        especialidades: {
          include: {
            especialidade: true
          }
        }
      }
    });

    const profissionalData = {
      id: novoProfissional.id,
      _id: novoProfissional.id,
      email: novoProfissional.email,
      nome: novoProfissional.nome,
      contato: novoProfissional.contato,
      foto: novoProfissional.foto,
      regiao_atuacao: novoProfissional.regiao_atuacao,
      especialidades: novoProfissional.especialidades.map(pe => pe.especialidade.nome)
    };
    
    console.log('Dados do profissional retornados no registro:', profissionalData);
    
    res.status(201).json({
      message: 'Profissional registrado com sucesso',
      profissional: profissionalData
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login universal (profissional ou cliente)
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Primeiro, tentar encontrar como profissional
    let profissional = await prisma.profissional.findUnique({
      where: { email },
      include: {
        especialidades: {
          include: {
            especialidade: true
          }
        }
      }
    });

    if (profissional) {
      // Verificar senha (apenas para usuários com senha local)
      if (profissional.senha) {
        const senhaValida = await bcrypt.compare(senha, profissional.senha);
        if (!senhaValida) {
          return res.status(400).json({ message: 'Credenciais inválidas' });
        }
      } else {
        return res.status(400).json({ message: 'Use o login com Google para esta conta' });
      }

      // Buscar a assinatura mais recente para obter o status e a URL de pagamento pendente
      const assinatura = await prisma.assinatura.findFirst({
        where: { profissional_id: profissional.id },
        orderBy: { data_criacao: 'desc' },
      });

      // Gerar token JWT
      const token = jwt.sign(
        { id: profissional.id, tipo: 'profissional' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Standardized user object
      const userData = {
        id: profissional.id,
        email: profissional.email,
        nome: profissional.nome,
        tipo: 'profissional', // Add type to the response object
        status_assinatura: assinatura?.status || 'INATIVO',
        pending_payment_url: assinatura?.status === 'PENDENTE' ? assinatura.pending_payment_url : null,
        // Add other professional-specific fields if needed by the frontend
        contato: profissional.contato,
        foto: profissional.foto,
        regiao_atuacao: profissional.regiao_atuacao,
        especialidades: profissional.especialidades.map(pe => pe.especialidade.nome)
      };
      
      return res.json({
        token,
        user: userData
      });
    }

    // If not found as a professional, try as a client
    const cliente = await prisma.cliente.findUnique({
      where: { email }
    });

    if (cliente) {
      // TODO: Implement proper password check for clientes.
      // For now, allow login as per original logic.
      if (cliente.senha) {
        const senhaValida = await bcrypt.compare(senha, cliente.senha);
        if (!senhaValida) {
          return res.status(400).json({ message: 'Credenciais inválidas' });
        }
      }

      // Buscar a assinatura mais recente do cliente
      const assinaturaCliente = await prisma.assinaturaCliente.findFirst({
        where: { cliente_id: cliente.id },
        orderBy: { data_criacao: 'desc' },
      });

      // Gerar token JWT
      const token = jwt.sign(
        { id: cliente.id, tipo: 'cliente' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Standardized user object
      const userData = {
        id: cliente.id,
        email: cliente.email,
        nome: cliente.nome,
        tipo: 'cliente', // Add type to the response object
        status_assinatura: assinaturaCliente?.status || 'INATIVO',
        pending_payment_url: assinaturaCliente?.status === 'PENDENTE' ? assinaturaCliente.pending_payment_url : null,
        contato: cliente.contato,
        regiao: cliente.regiao
      };
      
      return res.json({
        token,
        user: userData
      });
    }

    // If not found anywhere
    return res.status(400).json({ message: 'Credenciais inválidas' });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login/Registro com Google
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, nome, foto } = req.body;

    if (!googleId || !email || !nome) {
      return res.status(400).json({ message: 'Dados do Google incompletos' });
    }

    // This flow is for 'Profissional' users only based on the logic.
    // Find or create a professional
    let profissional = await prisma.profissional.findFirst({
      where: {
        OR: [
          { googleId },
          { email }
        ]
      },
      include: {
        especialidades: {
          include: {
            especialidade: true
          }
        }
      }
    });

    if (!profissional) {
      // Criar novo profissional com Google
      profissional = await prisma.profissional.create({
        data: {
          nome,
          email,
          googleId,
          foto: foto || '',
          contato: '', // Será preenchido no perfil
          regiao_atuacao: '', // Será preenchido no perfil
          cpf_cnpj: '', // Inicializa como vazio, o usuário preencherá depois
          status_assinatura: 'PENDENTE'
        },
        include: {
          especialidades: {
            include: {
              especialidade: true
            }
          }
        }
      });
    } else if (!profissional.googleId) {
      // Vincular conta existente ao Google
      profissional = await prisma.profissional.update({
        where: { id: profissional.id },
        data: {
          googleId,
          foto: foto || profissional.foto
        },
        include: {
          especialidades: {
            include: {
              especialidade: true
            }
          }
        }
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: profissional.id, tipo: 'profissional' }, // FIX: Added user type to token
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Standardized user object for response
    const userData = {
        id: profissional.id,
        email: profissional.email,
        nome: profissional.nome,
        tipo: 'profissional',
        foto: profissional.foto,
        isNewUser: !profissional.contato || !profissional.regiao_atuacao
    };

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Erro no login Google:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Registro de cliente (produtor)
router.post('/register-cliente', async (req, res) => {
  try {
    const { nome, email, senha, contato, regiao, cpf_cnpj } = req.body;

    // Verificar se o cliente já existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { email }
    });

    if (clienteExistente) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Verificar se o CPF/CNPJ já existe
     if (cpf_cnpj) {
       const cpfExistente = await prisma.cliente.findUnique({
           where: { cpf_cnpj },
       });
       if (cpfExistente) {
           return res.status(400).json({ message: 'CPF/CNPJ já está em uso' });
       }
     }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Criar novo cliente
    const novoCliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        senha: senhaHash, // Store the hashed password
        contato,
        regiao: regiao || '',
        cpf_cnpj, // <-- CORREÇÃO: Adicionado o campo
        tipo_cliente: 'PRODUTOR'
      }
    });

    const clienteData = {
      id: novoCliente.id,
      _id: novoCliente.id,
      email: novoCliente.email,
      nome: novoCliente.nome,
      contato: novoCliente.contato,
      regiao: novoCliente.regiao,
      tipo_cliente: novoCliente.tipo_cliente
    };
    
    console.log('Dados do cliente retornados no registro:', clienteData);
    
    res.status(201).json({
      message: 'Cliente registrado com sucesso',
      cliente: clienteData
    });
  } catch (error) {
    console.error('Erro no registro de cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para buscar dados do usuário logado
const auth = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    const user = req.user;
    const userType = req.userType;

    let fullUser;
    let assinaturaInfo = null;

    if (userType === 'profissional') {
      fullUser = await prisma.profissional.findUnique({
        where: { id: user.id },
        include: {
          especialidades: {
            include: { especialidade: true }
          }
        }
      });

      const assinatura = await prisma.assinatura.findFirst({
        where: { profissional_id: user.id },
        orderBy: { data_criacao: 'desc' },
      });
      if (assinatura) {
        assinaturaInfo = {
          status_assinatura: assinatura.status,
          pending_payment_url: assinatura.status === 'PENDENTE' ? assinatura.pending_payment_url : null
        };
      }

    } else if (userType === 'cliente') {
      fullUser = await prisma.cliente.findUnique({ where: { id: user.id } });

      const assinaturaCliente = await prisma.assinaturaCliente.findFirst({
        where: { cliente_id: user.id },
        orderBy: { data_criacao: 'desc' },
      });
      if (assinaturaCliente) {
        assinaturaInfo = {
          status_assinatura: assinaturaCliente.status,
          pending_payment_url: assinaturaCliente.status === 'PENDENTE' ? assinaturaCliente.pending_payment_url : null
        };
      }
    }

    if (!fullUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Combina dados do usuário com informações da assinatura
    const userData = {
      ...fullUser,
      tipo: userType,
      status_assinatura: assinaturaInfo?.status_assinatura || 'INATIVO',
      pending_payment_url: assinaturaInfo?.pending_payment_url || null,
    };

    res.json(userData);

  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;

