-- CreateEnum
CREATE TYPE "public"."status_assinatura" AS ENUM ('ATIVO', 'INATIVO', 'PENDENTE', 'CANCELADO', 'VENCIDO');

-- CreateEnum
CREATE TYPE "public"."status_interacao" AS ENUM ('AGENDADO', 'CONCLUIDO', 'EM_ANDAMENTO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "public"."tipo_remetente" AS ENUM ('PRODUTOR', 'PROFISSIONAL', 'SISTEMA');

-- CreateEnum
CREATE TYPE "public"."dia_semana" AS ENUM ('SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "public"."tipo_plano" AS ENUM ('BASICO', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."status_pagamento" AS ENUM ('PENDENTE', 'CONFIRMADO', 'VENCIDO', 'CANCELADO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "public"."metodo_pagamento" AS ENUM ('PIX', 'BOLETO', 'CARTAO_CREDITO', 'CARTAO_DEBITO');

-- CreateTable
CREATE TABLE "public"."profissionais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "googleId" TEXT,
    "contato" TEXT NOT NULL,
    "foto" TEXT,
    "regiao_atuacao" TEXT NOT NULL,
    "status_assinatura" "public"."status_assinatura" NOT NULL DEFAULT 'PENDENTE',
    "asaas_customer_id" TEXT,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profissionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."especialidades" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profissional_especialidades" (
    "profissional_id" TEXT NOT NULL,
    "especialidade_id" TEXT NOT NULL,

    CONSTRAINT "profissional_especialidades_pkey" PRIMARY KEY ("profissional_id","especialidade_id")
);

-- CreateTable
CREATE TABLE "public"."agenda_disponibilidade" (
    "id" TEXT NOT NULL,
    "profissional_id" TEXT NOT NULL,
    "dia_semana" "public"."dia_semana" NOT NULL,
    "horario_inicio" TEXT NOT NULL,
    "horario_fim" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "agenda_disponibilidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."produtores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "contato" TEXT NOT NULL,
    "email" TEXT,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produtores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interacoes" (
    "id" TEXT NOT NULL,
    "produtor_id" TEXT NOT NULL,
    "profissional_id" TEXT,
    "mensagem_inicial" TEXT NOT NULL,
    "status" "public"."status_interacao" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "dor_cliente" TEXT,
    "data_interacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."historico_mensagens" (
    "id" TEXT NOT NULL,
    "interacao_id" TEXT NOT NULL,
    "remetente" "public"."tipo_remetente" NOT NULL,
    "mensagem" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."avaliacoes" (
    "id" TEXT NOT NULL,
    "profissional_id" TEXT NOT NULL,
    "produtor_id" TEXT NOT NULL,
    "nota" SMALLINT NOT NULL,
    "comentario" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assinaturas" (
    "id" TEXT NOT NULL,
    "profissional_id" TEXT NOT NULL,
    "asaas_subscription_id" TEXT NOT NULL,
    "plano" "public"."tipo_plano" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "public"."status_assinatura" NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3),
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pagamentos" (
    "id" TEXT NOT NULL,
    "assinatura_id" TEXT NOT NULL,
    "asaas_payment_id" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "public"."status_pagamento" NOT NULL,
    "metodo_pagamento" "public"."metodo_pagamento" NOT NULL,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_email_key" ON "public"."profissionais"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_googleId_key" ON "public"."profissionais"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_asaas_customer_id_key" ON "public"."profissionais"("asaas_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_nome_key" ON "public"."especialidades"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "assinaturas_asaas_subscription_id_key" ON "public"."assinaturas"("asaas_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_asaas_payment_id_key" ON "public"."pagamentos"("asaas_payment_id");

-- AddForeignKey
ALTER TABLE "public"."profissional_especialidades" ADD CONSTRAINT "profissional_especialidades_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profissional_especialidades" ADD CONSTRAINT "profissional_especialidades_especialidade_id_fkey" FOREIGN KEY ("especialidade_id") REFERENCES "public"."especialidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agenda_disponibilidade" ADD CONSTRAINT "agenda_disponibilidade_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interacoes" ADD CONSTRAINT "interacoes_produtor_id_fkey" FOREIGN KEY ("produtor_id") REFERENCES "public"."produtores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interacoes" ADD CONSTRAINT "interacoes_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historico_mensagens" ADD CONSTRAINT "historico_mensagens_interacao_id_fkey" FOREIGN KEY ("interacao_id") REFERENCES "public"."interacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."avaliacoes" ADD CONSTRAINT "avaliacoes_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."avaliacoes" ADD CONSTRAINT "avaliacoes_produtor_id_fkey" FOREIGN KEY ("produtor_id") REFERENCES "public"."produtores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assinaturas" ADD CONSTRAINT "assinaturas_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pagamentos" ADD CONSTRAINT "pagamentos_assinatura_id_fkey" FOREIGN KEY ("assinatura_id") REFERENCES "public"."assinaturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
