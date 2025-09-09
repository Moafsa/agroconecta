const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateVerificationSystem() {
  console.log('🔄 Iniciando migração do sistema de verificação...');
  
  try {
    // Verificar se as colunas já existem
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profissionais' 
      AND column_name IN ('status_verificacao', 'nivel_verificacao', 'data_verificacao', 'admin_verificador_id')
    `;
    
    if (result.length > 0) {
      console.log('✅ Colunas de verificação já existem, pulando migração...');
      return;
    }

    console.log('📝 Criando enums...');
    
    // Criar enums se não existirem
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "public"."status_verificacao" AS ENUM ('PENDENTE', 'EM_ANALISE', 'VERIFICADO', 'REJEITADO', 'EXPIRADO');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "public"."nivel_verificacao" AS ENUM ('BASICO', 'INTERMEDIARIO', 'AVANCADO', 'PREMIUM');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "public"."tipo_documento" AS ENUM ('CPF', 'CNPJ', 'RG', 'CRMV', 'CREA', 'CERTIFICADO_PROFISSIONAL', 'DIPLOMA', 'OUTRO');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    console.log('📝 Adicionando colunas à tabela profissionais...');
    
    // Adicionar colunas à tabela profissionais
    await prisma.$executeRaw`
      ALTER TABLE "public"."profissionais" 
      ADD COLUMN IF NOT EXISTS "status_verificacao" "public"."status_verificacao" NOT NULL DEFAULT 'PENDENTE'
    `;

    await prisma.$executeRaw`
      ALTER TABLE "public"."profissionais" 
      ADD COLUMN IF NOT EXISTS "nivel_verificacao" "public"."nivel_verificacao" NOT NULL DEFAULT 'BASICO'
    `;

    await prisma.$executeRaw`
      ALTER TABLE "public"."profissionais" 
      ADD COLUMN IF NOT EXISTS "data_verificacao" TIMESTAMP(3)
    `;

    await prisma.$executeRaw`
      ALTER TABLE "public"."profissionais" 
      ADD COLUMN IF NOT EXISTS "admin_verificador_id" TEXT
    `;

    console.log('📝 Criando tabela documentos_verificacao...');
    
    // Criar tabela documentos_verificacao
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."documentos_verificacao" (
        "id" TEXT NOT NULL,
        "profissional_id" TEXT NOT NULL,
        "tipo_documento" "public"."tipo_documento" NOT NULL,
        "numero_documento" TEXT NOT NULL,
        "arquivo_url" TEXT,
        "status" "public"."status_verificacao" NOT NULL DEFAULT 'PENDENTE',
        "observacoes" TEXT,
        "data_upload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "data_verificacao" TIMESTAMP(3),
        "admin_verificador_id" TEXT,
        CONSTRAINT "documentos_verificacao_pkey" PRIMARY KEY ("id")
      )
    `;

    console.log('📝 Criando tabela certificacoes...');
    
    // Criar tabela certificacoes
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."certificacoes" (
        "id" TEXT NOT NULL,
        "profissional_id" TEXT NOT NULL,
        "nome" TEXT NOT NULL,
        "instituicao" TEXT NOT NULL,
        "numero_certificado" TEXT,
        "data_emissao" TIMESTAMP(3) NOT NULL,
        "data_validade" TIMESTAMP(3),
        "arquivo_url" TEXT,
        "status" "public"."status_verificacao" NOT NULL DEFAULT 'PENDENTE',
        "observacoes" TEXT,
        "data_upload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "data_verificacao" TIMESTAMP(3),
        "admin_verificador_id" TEXT,
        CONSTRAINT "certificacoes_pkey" PRIMARY KEY ("id")
      )
    `;

    console.log('📝 Adicionando foreign keys...');
    
    // Adicionar foreign keys se não existirem
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "public"."profissionais" 
        ADD CONSTRAINT "profissionais_admin_verificador_id_fkey" 
        FOREIGN KEY ("admin_verificador_id") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "public"."documentos_verificacao" 
        ADD CONSTRAINT "documentos_verificacao_profissional_id_fkey" 
        FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "public"."documentos_verificacao" 
        ADD CONSTRAINT "documentos_verificacao_admin_verificador_id_fkey" 
        FOREIGN KEY ("admin_verificador_id") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "public"."certificacoes" 
        ADD CONSTRAINT "certificacoes_profissional_id_fkey" 
        FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "public"."certificacoes" 
        ADD CONSTRAINT "certificacoes_admin_verificador_id_fkey" 
        FOREIGN KEY ("admin_verificador_id") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    console.log('✅ Migração do sistema de verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateVerificationSystem()
    .then(() => {
      console.log('🎉 Migração finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na migração:', error);
      process.exit(1);
    });
}

module.exports = { migrateVerificationSystem };
