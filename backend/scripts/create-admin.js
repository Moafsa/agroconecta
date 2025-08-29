const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

async function createDefaultAdmin() {
  try {
    console.log('Criando admin padrão...');

    // Verificar se já existe um admin
    const adminExistente = await prisma.admin.findUnique({
      where: { email: 'admin@agroconecta.com' }
    });

    if (adminExistente) {
      console.log('Admin já existe!');
      return;
    }

    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash('admin123', 10);

    // Criar admin
    const admin = await prisma.admin.create({
      data: {
        nome: 'Administrador',
        email: 'admin@agroconecta.com',
        senha: senhaCriptografada,
        nivel_acesso: 'SUPER_ADMIN',
        ativo: true
      }
    });

    console.log('Admin criado com sucesso!');
    console.log('Email:', admin.email);
    console.log('Senha: admin123');
    console.log('ID:', admin.id);

  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultAdmin();
