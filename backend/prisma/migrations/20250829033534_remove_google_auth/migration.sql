/*
  Warnings:

  - You are about to drop the column `googleId` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `profissionais` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "clientes_googleId_key";

-- DropIndex
DROP INDEX "profissionais_googleId_key";

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "googleId";

-- AlterTable
ALTER TABLE "profissionais" DROP COLUMN "googleId";
