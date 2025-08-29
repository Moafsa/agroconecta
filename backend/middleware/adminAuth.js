const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Token não fornecido na requisição:', req.url);
      return res.status(401).json({ message: 'Token de acesso requerido' });
    }
    console.log('Token recebido:', token.substring(0, 10) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);
    
    // Verificar se é um token de admin
    if (decoded.tipo !== 'admin') {
      return res.status(401).json({ message: 'Acesso negado. Token de admin requerido.' });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id }
    });
    
    if (!admin || !admin.ativo) {
      return res.status(401).json({ message: 'Admin não encontrado ou inativo' });
    }

    req.user = admin;
    next();
  } catch (error) {
    console.error('Erro na autenticação do admin:', error.message);
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = adminAuth;
