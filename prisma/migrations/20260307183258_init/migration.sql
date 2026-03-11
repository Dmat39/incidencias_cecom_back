-- CreateTable
CREATE TABLE "medio_reportes" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT,
    "descripcion" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "numeracion" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "medio_reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_casos" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "unidadId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tipo_casos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_tipo_casos" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "tipoCasoId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sub_tipo_casos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_reportantes" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tipo_reportantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "severidades" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "severidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "severidad_procesos" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "severidad_procesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_incidencias" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "estado_incidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_procesos" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "estado_procesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo_serenos" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cargo_serenos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operadores" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "medioId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "operadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jurisdicciones" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT,
    "nombre" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "jurisdicciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genero_agresores" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "genero_agresores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genero_victimas" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "genero_victimas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_delitos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tipo_delitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "medioId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_roles" (
    "usuarioId" INTEGER NOT NULL,
    "rolId" INTEGER NOT NULL,

    CONSTRAINT "usuario_roles_pkey" PRIMARY KEY ("usuarioId","rolId")
);

-- CreateTable
CREATE TABLE "rol_permisos" (
    "rolId" INTEGER NOT NULL,
    "permisoId" INTEGER NOT NULL,

    CONSTRAINT "rol_permisos_pkey" PRIMARY KEY ("rolId","permisoId")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "revokedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serenos" (
    "id" SERIAL NOT NULL,
    "dni" TEXT,
    "nombres" TEXT,
    "apellidoPaterno" TEXT,
    "apellidoMaterno" TEXT,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "cargoSerenoId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "serenos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidencias" (
    "id" SERIAL NOT NULL,
    "codigoIncidencia" TEXT,
    "unidadId" INTEGER,
    "tipoCasoId" INTEGER,
    "subTipoCasoId" INTEGER,
    "tipoReportanteId" INTEGER,
    "nombreReportante" TEXT,
    "telefonoReportante" TEXT,
    "direccion" TEXT,
    "latitud" DECIMAL(10,8),
    "longitud" DECIMAL(11,8),
    "descripcion" TEXT,
    "registradoEn" TIMESTAMPTZ(6),
    "ocurridoEn" TIMESTAMPTZ(6),
    "atendidoEn" TIMESTAMPTZ(6),
    "severidadId" INTEGER,
    "jurisdiccionId" INTEGER,
    "situacionId" INTEGER,
    "medioId" INTEGER,
    "operadorId" INTEGER,
    "usuarioId" INTEGER,
    "descripcionIntervencion" TEXT,
    "nombreAgraviado" TEXT,
    "telefonoAgraviado" TEXT,
    "estadoProcesoId" INTEGER,
    "generoAgresorId" INTEGER,
    "generoVictimaId" INTEGER,
    "severidadProcesoId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "incidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidencia_serenos" (
    "id" SERIAL NOT NULL,
    "incidenciaId" INTEGER NOT NULL,
    "serenoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "incidencia_serenos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias" (
    "id" SERIAL NOT NULL,
    "nombreArchivo" TEXT,
    "rutaArchivo" TEXT,
    "fechaHoraRegistro" TIMESTAMPTZ(6),
    "incidenciaId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rutas" (
    "id" SERIAL NOT NULL,
    "fecha" DATE,
    "hora" TEXT,
    "latitud" DECIMAL(10,8),
    "longitud" DECIMAL(11,8),
    "unidadId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "rutas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delitos" (
    "id" SERIAL NOT NULL,
    "direccion" TEXT,
    "latitud" DECIMAL(10,8),
    "longitud" DECIMAL(11,8),
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "jurisdiccionId" INTEGER,
    "tipoDelitoId" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "delitos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_nombre_key" ON "permisos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "serenos_dni_key" ON "serenos"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "incidencias_codigoIncidencia_key" ON "incidencias"("codigoIncidencia");

-- CreateIndex
CREATE UNIQUE INDEX "incidencia_serenos_incidenciaId_serenoId_key" ON "incidencia_serenos"("incidenciaId", "serenoId");

-- AddForeignKey
ALTER TABLE "tipo_casos" ADD CONSTRAINT "tipo_casos_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_tipo_casos" ADD CONSTRAINT "sub_tipo_casos_tipoCasoId_fkey" FOREIGN KEY ("tipoCasoId") REFERENCES "tipo_casos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operadores" ADD CONSTRAINT "operadores_medioId_fkey" FOREIGN KEY ("medioId") REFERENCES "medio_reportes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_medioId_fkey" FOREIGN KEY ("medioId") REFERENCES "medio_reportes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_roles" ADD CONSTRAINT "usuario_roles_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_roles" ADD CONSTRAINT "usuario_roles_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serenos" ADD CONSTRAINT "serenos_cargoSerenoId_fkey" FOREIGN KEY ("cargoSerenoId") REFERENCES "cargo_serenos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_tipoCasoId_fkey" FOREIGN KEY ("tipoCasoId") REFERENCES "tipo_casos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_subTipoCasoId_fkey" FOREIGN KEY ("subTipoCasoId") REFERENCES "sub_tipo_casos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_tipoReportanteId_fkey" FOREIGN KEY ("tipoReportanteId") REFERENCES "tipo_reportantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_severidadId_fkey" FOREIGN KEY ("severidadId") REFERENCES "severidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_jurisdiccionId_fkey" FOREIGN KEY ("jurisdiccionId") REFERENCES "jurisdicciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_situacionId_fkey" FOREIGN KEY ("situacionId") REFERENCES "estado_incidencias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_medioId_fkey" FOREIGN KEY ("medioId") REFERENCES "medio_reportes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "operadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_estadoProcesoId_fkey" FOREIGN KEY ("estadoProcesoId") REFERENCES "estado_procesos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_generoAgresorId_fkey" FOREIGN KEY ("generoAgresorId") REFERENCES "genero_agresores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_generoVictimaId_fkey" FOREIGN KEY ("generoVictimaId") REFERENCES "genero_victimas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_severidadProcesoId_fkey" FOREIGN KEY ("severidadProcesoId") REFERENCES "severidad_procesos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencia_serenos" ADD CONSTRAINT "incidencia_serenos_incidenciaId_fkey" FOREIGN KEY ("incidenciaId") REFERENCES "incidencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidencia_serenos" ADD CONSTRAINT "incidencia_serenos_serenoId_fkey" FOREIGN KEY ("serenoId") REFERENCES "serenos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_incidenciaId_fkey" FOREIGN KEY ("incidenciaId") REFERENCES "incidencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delitos" ADD CONSTRAINT "delitos_jurisdiccionId_fkey" FOREIGN KEY ("jurisdiccionId") REFERENCES "jurisdicciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delitos" ADD CONSTRAINT "delitos_tipoDelitoId_fkey" FOREIGN KEY ("tipoDelitoId") REFERENCES "tipo_delitos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
