/*
  Warnings:

  - You are about to drop the column `plano` on the `assinaturas` table. All the data in the column will be lost.
  - Added the required column `plano_id` to the `assinaturas` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."nivel_acesso" AS ENUM ('ADMIN', 'SUPER_ADMIN', 'MODERADOR');

-- CreateEnum
CREATE TYPE "public"."tipo_cliente" AS ENUM ('PRODUTOR', 'EMPRESA', 'COOPERATIVA', 'CONSULTOR');

-- CreateEnum
CREATE TYPE "public"."categoria_plano" AS ENUM ('PROFISSIONAL', 'CLIENTE');

-- CreateEnum
CREATE TYPE "public"."periodo_plano" AS ENUM ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- AlterEnum
ALTER TYPE "public"."tipo_remetente" ADD VALUE 'CLIENTE';

-- AlterTable
ALTER TABLE "public"."assinaturas" DROP COLUMN "plano",
ADD COLUMN     "plano_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nivel_acesso" "public"."nivel_acesso" NOT NULL DEFAULT 'ADMIN',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contato" TEXT NOT NULL,
    "tipo_cliente" "public"."tipo_cliente" NOT NULL DEFAULT 'PRODUTOR',
    "regiao" TEXT,
    "status_assinatura" "public"."status_assinatura" NOT NULL DEFAULT 'PENDENTE',
    "asaas_customer_id" TEXT,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."planos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo_plano" "public"."tipo_plano" NOT NULL,
    "categoria" "public"."categoria_plano" NOT NULL DEFAULT 'PROFISSIONAL',
    "valor" DECIMAL(10,2) NOT NULL,
    "periodo" "public"."periodo_plano" NOT NULL DEFAULT 'MENSAL',
    "recursos" TEXT[],
    "limite_consultas" INTEGER,
    "limite_profissionais" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "admin_criador_id" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interacoes_cliente" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "profissional_id" TEXT,
    "mensagem_inicial" TEXT NOT NULL,
    "status" "public"."status_interacao" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "tipo_consulta" TEXT,
    "data_interacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interacoes_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."historico_mensagens_cliente" (
    "id" TEXT NOT NULL,
    "interacao_cliente_id" TEXT NOT NULL,
    "remetente" "public"."tipo_remetente" NOT NULL,
    "mensagem" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_mensagens_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assinaturas_cliente" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "plano_id" TEXT NOT NULL,
    "asaas_subscription_id" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "public"."status_assinatura" NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3),
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinaturas_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pagamentos_cliente" (
    "id" TEXT NOT NULL,
    "assinatura_cliente_id" TEXT NOT NULL,
    "asaas_payment_id" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "public"."status_pagamento" NOT NULL,
    "metodo_pagamento" "public"."metodo_pagamento" NOT NULL,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "public"."clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_asaas_customer_id_key" ON "public"."clientes"("asaas_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "assinaturas_cliente_asaas_subscription_id_key" ON "public"."assinaturas_cliente"("asaas_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_cliente_asaas_payment_id_key" ON "public"."pagamentos_cliente"("asaas_payment_id");

-- AddForeignKey
ALTER TABLE "public"."planos" ADD CONSTRAINT "planos_admin_criador_id_fkey" FOREIGN KEY ("admin_criador_id") REFERENCES "public"."admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interacoes_cliente" ADD CONSTRAINT "interacoes_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interacoes_cliente" ADD CONSTRAINT "interacoes_cliente_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historico_mensagens_cliente" ADD CONSTRAINT "historico_mensagens_cliente_interacao_cliente_id_fkey" FOREIGN KEY ("interacao_cliente_id") REFERENCES "public"."interacoes_cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assinaturas" ADD CONSTRAINT "assinaturas_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "public"."planos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assinaturas_cliente" ADD CONSTRAINT "assinaturas_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assinaturas_cliente" ADD CONSTRAINT "assinaturas_cliente_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "public"."planos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pagamentos_cliente" ADD CONSTRAINT "pagamentos_cliente_assinatura_cliente_id_fkey" FOREIGN KEY ("assinatura_cliente_id") REFERENCES "public"."assinaturas_cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
