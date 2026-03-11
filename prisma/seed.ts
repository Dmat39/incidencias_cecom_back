import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ─── MEDIOS ────────────────────────────────────────────────────────────────
  const medios = await Promise.all([
    prisma.medioReporte.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, codigo: 'R', descripcion: 'Radio', numeracion: 1 },
    }),
    prisma.medioReporte.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, codigo: 'G', descripcion: 'CCTV / Grabación', numeracion: 2 },
    }),
    prisma.medioReporte.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, codigo: 'T', descripcion: 'Transporte', numeracion: 3 },
    }),
    prisma.medioReporte.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, codigo: 'C', descripcion: 'Celular / Llamada', numeracion: 4 },
    }),
    prisma.medioReporte.upsert({
      where: { id: 8 },
      update: {},
      create: { id: 8, codigo: 'WA', descripcion: 'WhatsApp', numeracion: 8 },
    }),
    prisma.medioReporte.upsert({
      where: { id: 9 },
      update: {},
      create: { id: 9, codigo: 'BP', descripcion: 'Boletín / Prensa', numeracion: 9 },
    }),
  ]);
  console.log(`  ✅ Medios: ${medios.length}`);

  // ─── UNIDADES ──────────────────────────────────────────────────────────────
  const unidades = await Promise.all([
    prisma.unidad.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, descripcion: 'SERENAZGO' },
    }),
    prisma.unidad.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, descripcion: 'POLICÍA' },
    }),
    prisma.unidad.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, descripcion: 'BOMBEROS' },
    }),
  ]);
  console.log(`  ✅ Unidades: ${unidades.length}`);

  // ─── TIPO CASOS ────────────────────────────────────────────────────────────
  const tipoCasos = await Promise.all([
    prisma.tipoCaso.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, descripcion: 'EMERGENCIA', unidadId: 1 },
    }),
    prisma.tipoCaso.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, descripcion: 'ACCIDENTE', unidadId: 1 },
    }),
    prisma.tipoCaso.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, descripcion: 'DELITO', unidadId: 1 },
    }),
    prisma.tipoCaso.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, descripcion: 'VIOLENCIA FAMILIAR', unidadId: 1 },
    }),
  ]);
  console.log(`  ✅ Tipos de caso: ${tipoCasos.length}`);

  // ─── SUBTIPO CASOS ─────────────────────────────────────────────────────────
  const subTipoCasos = await Promise.all([
    prisma.subTipoCaso.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, descripcion: 'PERSONA HERIDA', tipoCasoId: 1 },
    }),
    prisma.subTipoCaso.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, descripcion: 'INCENDIO', tipoCasoId: 1 },
    }),
    prisma.subTipoCaso.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, descripcion: 'COLISIÓN VEHICULAR', tipoCasoId: 2 },
    }),
    prisma.subTipoCaso.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, descripcion: 'ROBO AL PASO', tipoCasoId: 3 },
    }),
    prisma.subTipoCaso.upsert({
      where: { id: 5 },
      update: {},
      create: { id: 5, descripcion: 'ROBO AGRAVADO', tipoCasoId: 3 },
    }),
  ]);
  console.log(`  ✅ Subtipos de caso: ${subTipoCasos.length}`);

  // ─── ESTADO INCIDENCIAS ────────────────────────────────────────────────────
  const estadoIncidencias = await Promise.all([
    prisma.estadoIncidencia.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, descripcion: 'PENDIENTE' },
    }),
    prisma.estadoIncidencia.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, descripcion: 'EN ATENCIÓN' },
    }),
    prisma.estadoIncidencia.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, descripcion: 'ATENDIDA' },
    }),
    prisma.estadoIncidencia.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, descripcion: 'CERRADA' },
    }),
    prisma.estadoIncidencia.upsert({
      where: { id: 5 },
      update: {},
      create: { id: 5, descripcion: 'CANCELADA' },
    }),
  ]);
  console.log(`  ✅ Estados de incidencia: ${estadoIncidencias.length}`);

  // ─── SEVERIDADES ───────────────────────────────────────────────────────────
  const severidades = await Promise.all([
    prisma.severidad.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, descripcion: 'BAJA' },
    }),
    prisma.severidad.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, descripcion: 'MEDIA' },
    }),
    prisma.severidad.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, descripcion: 'ALTA' },
    }),
    prisma.severidad.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, descripcion: 'CRÍTICA' },
    }),
  ]);
  console.log(`  ✅ Severidades: ${severidades.length}`);

  // ─── TIPO REPORTANTES ──────────────────────────────────────────────────────
  await Promise.all([
    prisma.tipoReportante.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, descripcion: 'CIUDADANO' },
    }),
    prisma.tipoReportante.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, descripcion: 'SERENAZGO' },
    }),
    prisma.tipoReportante.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, descripcion: 'POLICÍA' },
    }),
    prisma.tipoReportante.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, descripcion: 'ANÓNIMO' },
    }),
  ]);
  console.log('  ✅ Tipos de reportante');

  // ─── CARGO SERENOS ─────────────────────────────────────────────────────────
  await Promise.all([
    prisma.cargoSereno.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, descripcion: 'SERENO' },
    }),
    prisma.cargoSereno.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, descripcion: 'SUPERVISOR' },
    }),
    prisma.cargoSereno.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, descripcion: 'COMANDANTE' },
    }),
  ]);
  console.log('  ✅ Cargos de sereno');

  // ─── ESTADO PROCESOS ───────────────────────────────────────────────────────
  await Promise.all([
    prisma.estadoProceso.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, descripcion: 'INTERVENIDO' },
    }),
    prisma.estadoProceso.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, descripcion: 'DERIVADO A PNP' },
    }),
    prisma.estadoProceso.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, descripcion: 'DERIVADO A HOSPITAL' },
    }),
  ]);
  console.log('  ✅ Estados de proceso');

  // ─── GENERO AGRESOR/VÍCTIMA ────────────────────────────────────────────────
  await Promise.all([
    prisma.generoAgresor.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, descripcion: 'MASCULINO' },
    }),
    prisma.generoAgresor.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, descripcion: 'FEMENINO' },
    }),
    prisma.generoAgresor.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, descripcion: 'NO IDENTIFICADO' },
    }),
  ]);

  await Promise.all([
    prisma.generoVictima.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, descripcion: 'MASCULINO' },
    }),
    prisma.generoVictima.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, descripcion: 'FEMENINO' },
    }),
    prisma.generoVictima.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, descripcion: 'INFANTE' },
    }),
  ]);
  console.log('  ✅ Géneros');

  // ─── SEVERIDAD PROCESOS ────────────────────────────────────────────────────
  await Promise.all([
    prisma.severidadProceso.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, descripcion: 'LEVE' },
    }),
    prisma.severidadProceso.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, descripcion: 'MODERADO' },
    }),
    prisma.severidadProceso.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, descripcion: 'GRAVE' },
    }),
  ]);
  console.log('  ✅ Severidades de proceso');

  // ─── JURISDICCIONES ────────────────────────────────────────────────────────
  await Promise.all([
    prisma.jurisdiccion.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, codigo: 'J01', nombre: 'ZONA NORTE' },
    }),
    prisma.jurisdiccion.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, codigo: 'J02', nombre: 'ZONA SUR' },
    }),
    prisma.jurisdiccion.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, codigo: 'J03', nombre: 'ZONA ESTE' },
    }),
    prisma.jurisdiccion.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, codigo: 'J04', nombre: 'ZONA OESTE' },
    }),
    prisma.jurisdiccion.upsert({
      where: { id: 5 },
      update: {},
      create: { id: 5, codigo: 'J05', nombre: 'ZONA CENTRO' },
    }),
  ]);
  console.log('  ✅ Jurisdicciones');

  // ─── OPERADORES ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.operador.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, descripcion: 'CENTRAL RADIO', medioId: 1 },
    }),
    prisma.operador.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, descripcion: 'MONITOREO CCTV', medioId: 2 },
    }),
  ]);
  console.log('  ✅ Operadores');

  // ─── ROLES Y PERMISOS ──────────────────────────────────────────────────────
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: { nombre: 'admin', descripcion: 'Administrador del sistema' },
  });

  const rolOperador = await prisma.rol.upsert({
    where: { nombre: 'operador' },
    update: {},
    create: { nombre: 'operador', descripcion: 'Operador de central' },
  });

  const rolSupervisor = await prisma.rol.upsert({
    where: { nombre: 'supervisor' },
    update: {},
    create: { nombre: 'supervisor', descripcion: 'Supervisor' },
  });

  await prisma.rol.upsert({
    where: { nombre: 'validador' },
    update: {},
    create: { nombre: 'validador', descripcion: 'Validador SVI' },
  });

  console.log(`  ✅ Roles: admin, operador, supervisor, validador`);

  // ─── USUARIO ADMIN ─────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@cecom.gob.pe' },
    update: {},
    create: {
      nombres: 'Administrador',
      apellidos: 'CECOM',
      email: 'admin@cecom.gob.pe',
      username: 'admin',
      password: hashedPassword,
      habilitado: true,
    },
  });

  // Asignar rol admin al usuario
  await prisma.usuarioRol.upsert({
    where: { usuarioId_rolId: { usuarioId: admin.id, rolId: rolAdmin.id } },
    update: {},
    create: { usuarioId: admin.id, rolId: rolAdmin.id },
  });

  console.log(`  ✅ Usuario admin creado: admin@cecom.gob.pe / admin123`);

  console.log('\n✅ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
