/*
  Warnings:

  - A unique constraint covering the columns `[cpf_cnpj]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf_cnpj]` on the table `profissionais` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."clientes" ADD COLUMN     "cpf_cnpj" TEXT;

-- AlterTable
ALTER TABLE "public"."profissionais" ADD COLUMN     "cpf_cnpj" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_cnpj_key" ON "public"."clientes"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_cpf_cnpj_key" ON "public"."profissionais"("cpf_cnpj");
