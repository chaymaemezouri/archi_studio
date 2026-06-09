ALTER TABLE "Devis" ADD COLUMN "object" TEXT;
ALTER TABLE "Devis" ADD COLUMN "paymentTerms" TEXT;

ALTER TABLE "Invoice" ADD COLUMN "devisId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "object" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "bankTransferBy" TEXT;

ALTER TABLE "Settings" ADD COLUMN "cabinetCity" TEXT;
ALTER TABLE "Settings" ADD COLUMN "cabinetIce" TEXT;
ALTER TABLE "Settings" ADD COLUMN "cabinetRc" TEXT;
ALTER TABLE "Settings" ADD COLUMN "cabinetCnss" TEXT;
ALTER TABLE "Settings" ADD COLUMN "cabinetPatente" TEXT;

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "Devis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
