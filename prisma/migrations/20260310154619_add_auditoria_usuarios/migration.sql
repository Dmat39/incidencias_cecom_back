-- AlterTable
ALTER TABLE "sub_tipo_casos" ALTER COLUMN "codigo" SET DATA TYPE TEXT,
ALTER COLUMN "urgencia" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "tipo_casos" ALTER COLUMN "codigo" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "auditoria_usuarios" (
    "id" SERIAL NOT NULL,
    "accion" TEXT NOT NULL,
    "usuarioAfectadoId" INTEGER,
    "usuarioAfectado" TEXT NOT NULL,
    "realizadoPorId" INTEGER,
    "realizadoPor" TEXT NOT NULL,
    "detalles" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_usuarios_pkey" PRIMARY KEY ("id")
);
