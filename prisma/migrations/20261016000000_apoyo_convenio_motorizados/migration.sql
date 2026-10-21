-- CreateEnum
CREATE TYPE "tipo_motos" AS ENUM ('ANTIGUAS', 'NUEVAS', 'AMBAS');

-- AlterTable
ALTER TABLE "incidencias" ADD COLUMN     "apoyoConvenio" BOOLEAN,
ADD COLUMN     "participacionMotorizados" BOOLEAN,
ADD COLUMN     "tipoMotos" "tipo_motos";
