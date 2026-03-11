-- AlterTable: add modulo with default for existing rows
ALTER TABLE "auditoria_usuarios" ADD COLUMN IF NOT EXISTS "modulo" TEXT NOT NULL DEFAULT 'Usuarios';
-- Remove the default so future inserts must provide the value explicitly
ALTER TABLE "auditoria_usuarios" ALTER COLUMN "modulo" DROP DEFAULT;
