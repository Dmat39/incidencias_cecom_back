-- AlterTable
ALTER TABLE "auditoria_usuarios" ALTER COLUMN "modulo" SET DEFAULT 'Usuarios';

-- CreateTable
CREATE TABLE "usuario_jurisdicciones_asignadas" (
    "usuarioId" INTEGER NOT NULL,
    "jurisdiccionId" INTEGER NOT NULL,

    CONSTRAINT "usuario_jurisdicciones_asignadas_pkey" PRIMARY KEY ("usuarioId","jurisdiccionId")
);

-- CreateTable
CREATE TABLE "rol_jurisdicciones" (
    "rolId" INTEGER NOT NULL,
    "jurisdiccionId" INTEGER NOT NULL,

    CONSTRAINT "rol_jurisdicciones_pkey" PRIMARY KEY ("rolId","jurisdiccionId")
);

-- AddForeignKey
ALTER TABLE "usuario_jurisdicciones_asignadas" ADD CONSTRAINT "usuario_jurisdicciones_asignadas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_jurisdicciones_asignadas" ADD CONSTRAINT "usuario_jurisdicciones_asignadas_jurisdiccionId_fkey" FOREIGN KEY ("jurisdiccionId") REFERENCES "jurisdicciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_jurisdicciones" ADD CONSTRAINT "rol_jurisdicciones_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_jurisdicciones" ADD CONSTRAINT "rol_jurisdicciones_jurisdiccionId_fkey" FOREIGN KEY ("jurisdiccionId") REFERENCES "jurisdicciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
