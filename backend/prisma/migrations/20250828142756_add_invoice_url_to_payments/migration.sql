-- AlterTable
ALTER TABLE "public"."pagamentos" ADD COLUMN     "invoice_url" TEXT;

-- AlterTable
ALTER TABLE "public"."pagamentos_cliente" ADD COLUMN     "invoice_url" TEXT;
