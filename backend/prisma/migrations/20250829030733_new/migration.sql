/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clientes_googleId_key" ON "clientes"("googleId");
