-- AlterTable
ALTER TABLE "public"."assinaturas" ADD COLUMN     "pending_payment_url" TEXT;

-- AlterTable
ALTER TABLE "public"."assinaturas_cliente" ADD COLUMN     "pending_payment_url" TEXT;
