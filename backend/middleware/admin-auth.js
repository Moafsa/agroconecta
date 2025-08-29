const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar admin no banco
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel_acesso: true,
        ativo: true
      }
    });

    if (!admin || !admin.ativo) {
      return res.status(401).json({ message: 'Admin não encontrado ou inativo' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Erro na autenticação admin:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = adminAuth;
