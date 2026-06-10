-- Champs cabinet / banque / facturation (alignés sur schema.prisma)
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "cabinetWebsite" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "cabinetCountry" TEXT DEFAULT 'Maroc';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "bankRib" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "paymentTermsDays" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "invoiceFooter" TEXT;
