-- CreateEnum
CREATE TYPE "public"."status_verificacao" AS ENUM ('PENDENTE', 'EM_ANALISE', 'VERIFICADO', 'REJEITADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "public"."nivel_verificacao" AS ENUM ('BASICO', 'INTERMEDIARIO', 'AVANCADO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "public"."tipo_documento" AS ENUM ('CPF', 'CNPJ', 'RG', 'CRMV', 'CREA', 'CERTIFICADO_PROFISSIONAL', 'DIPLOMA', 'OUTRO');

-- AlterTable
ALTER TABLE "public"."profissionais" ADD COLUMN "status_verificacao" "public"."status_verificacao" NOT NULL DEFAULT 'PENDENTE';
ALTER TABLE "public"."profissionais" ADD COLUMN "nivel_verificacao" "public"."nivel_verificacao" NOT NULL DEFAULT 'BASICO';
ALTER TABLE "public"."profissionais" ADD COLUMN "data_verificacao" TIMESTAMP(3);
ALTER TABLE "public"."profissionais" ADD COLUMN "admin_verificador_id" TEXT;

-- CreateTable
CREATE TABLE "public"."documentos_verificacao" (
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
);

-- CreateTable
CREATE TABLE "public"."certificacoes" (
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
);

-- AddForeignKey
ALTER TABLE "public"."profissionais" ADD CONSTRAINT "profissionais_admin_verificador_id_fkey" FOREIGN KEY ("admin_verificador_id") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documentos_verificacao" ADD CONSTRAINT "documentos_verificacao_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."documentos_verificacao" ADD CONSTRAINT "documentos_verificacao_admin_verificador_id_fkey" FOREIGN KEY ("admin_verificador_id") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificacoes" ADD CONSTRAINT "certificacoes_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificacoes" ADD CONSTRAINT "certificacoes_admin_verificador_id_fkey" FOREIGN KEY ("admin_verificador_id") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
