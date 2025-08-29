const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupAdminPix() {
  try {
    console.log('🔧 Configurando wallet PIX do admin...');

    // Buscar o primeiro admin ativo
    const admin = await prisma.admin.findFirst({
      where: { ativo: true }
    });

    if (!admin) {
      console.error('❌ Nenhum admin ativo encontrado');
      return;
    }

    console.log(`📧 Admin encontrado: ${admin.email}`);

    // Verificar se já tem wallet PIX configurada
    if (admin.pix_wallet) {
      console.log(`✅ Wallet PIX já configurada: ${admin.pix_wallet}`);
      console.log('💡 Para alterar, use a interface web ou atualize diretamente no banco');
      return;
    }

    // Solicitar wallet PIX do usuário
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    console.log('\n📝 Configure a chave PIX para recebimento de pagamentos:');
    console.log('   Exemplos:');
    console.log('   - Telefone: 11999999999');
    console.log('   - Email: admin@empresa.com');
    console.log('   - CPF: 123.456.789-00');
    console.log('   - Chave aleatória: 12345678-1234-1234-1234-123456789012');
    
    const pixWallet = await question('\n🔑 Digite a chave PIX: ');

    if (!pixWallet.trim()) {
      console.log('❌ Chave PIX não pode estar vazia');
      rl.close();
      return;
    }

    // Atualizar admin com a wallet PIX
    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: { pix_wallet: pixWallet.trim() },
      select: {
        id: true,
        nome: true,
        email: true,
        pix_wallet: true
      }
    });

    console.log('\n✅ Wallet PIX configurada com sucesso!');
    console.log(`👤 Admin: ${updatedAdmin.nome} (${updatedAdmin.email})`);
    console.log(`🔑 Chave PIX: ${updatedAdmin.pix_wallet}`);
    console.log('\n💡 Agora os pagamentos serão processados corretamente!');

    rl.close();

  } catch (error) {
    console.error('❌ Erro ao configurar wallet PIX:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupAdminPix();
}

module.exports = setupAdminPix;
