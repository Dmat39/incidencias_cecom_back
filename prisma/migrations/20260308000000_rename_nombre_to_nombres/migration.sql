-- Rename column nombre -> nombres in usuarios table
-- Add apellidos column

ALTER TABLE "usuarios" RENAME COLUMN "nombre" TO "nombres";
ALTER TABLE "usuarios" ADD COLUMN "apellidos" TEXT;
