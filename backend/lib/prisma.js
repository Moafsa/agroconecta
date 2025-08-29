const { PrismaClient } = require('@prisma/client');

// Singleton pattern para o cliente Prisma
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Em desenvolvimento, usar uma instância global para evitar múltiplas conexões
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

module.exports = prisma;

