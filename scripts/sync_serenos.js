/**
 * sync_serenos.js
 * ──────────────────────────────────────────────────────────────────────
 * Sincroniza los empleados ACTIVOS de gestionate-backend (DB: tareaje)
 * hacia la tabla serenos de cecom-backend (DB: cecom_incidencias).
 *
 * Uso:
 *   node scripts/sync_serenos.js
 *
 * Desde la carpeta: C:\Users\ACER\Desktop\Proyectos\cecom-backend
 * ──────────────────────────────────────────────────────────────────────
 */

'use strict';

// pg desde gestionate-backend (ya tiene el paquete instalado)
const { Client } = require('C:\\Users\\ACER\\Desktop\\Proyectos\\gestionate-backend\\node_modules\\pg');
const { PrismaClient } = require('@prisma/client');

// ─── CONFIG GESTIONATE DB ─────────────────────────────────────────────
const gestConfig = {
  host:     'localhost',
  port:     5432,
  database: 'tareaje',
  user:     'postgres',
  password: 'matute123',
};

// ─── CARGO POR DEFECTO: 1 = SERENO ────────────────────────────────────
const CARGO_SERENO_ID = 1;

// ─── HELPERS ──────────────────────────────────────────────────────────
function splitApellidos(apellidos = '') {
  const partes = (apellidos || '').trim().split(/\s+/).filter(Boolean);
  const apellidoPaterno = partes[0] ?? '';
  const apellidoMaterno = partes.slice(1).join(' ');
  return { apellidoPaterno, apellidoMaterno };
}

// ─── MAIN ─────────────────────────────────────────────────────────────
async function main() {
  const gestClient = new Client(gestConfig);
  const prisma     = new PrismaClient();

  try {
    // 1. Conectar a gestionate DB
    await gestClient.connect();
    console.log('✅ Conectado a gestionate DB (tareaje)');

    // 2. Traer empleados ACTIVOS con DNI
    const { rows: empleados } = await gestClient.query(`
      SELECT dni, nombres, apellidos
      FROM   "Empleados"
      WHERE  state = true
        AND  dni IS NOT NULL
        AND  dni != ''
      ORDER  BY apellidos, nombres
    `);

    console.log(`📋 Empleados activos con DNI: ${empleados.length}`);
    if (empleados.length === 0) {
      console.log('⚠️  No hay empleados activos para sincronizar.');
      return;
    }

    // 3. Upsert via SQL raw: INSERT ... ON CONFLICT (dni) DO UPDATE
    //    Evita problemas con los serenos ya existentes sin DNI.
    let creados     = 0;
    let actualizados = 0;

    for (const emp of empleados) {
      const { dni, nombres } = emp;
      const { apellidoPaterno, apellidoMaterno } = splitApellidos(emp.apellidos);

      // Verificar si ya existe
      const existente = await prisma.sereno.findUnique({ where: { dni } });

      if (existente) {
        // Actualizar nombre/apellidos si cambiaron
        await prisma.sereno.update({
          where: { id: existente.id },
          data:  { nombres, apellidoPaterno, apellidoMaterno, habilitado: true },
        });
        actualizados++;
      } else {
        // Crear nuevo sereno
        await prisma.sereno.create({
          data: {
            dni,
            nombres,
            apellidoPaterno,
            apellidoMaterno,
            habilitado:    true,
            cargoSerenoId: CARGO_SERENO_ID,
          },
        });
        creados++;
      }

      // Log de progreso cada 100
      if ((creados + actualizados) % 100 === 0) {
        process.stdout.write(`\r   Procesados: ${creados + actualizados}/${empleados.length}...`);
      }
    }

    process.stdout.write('\n');
    console.log(`\n✅ Sincronización completada:`);
    console.log(`   • Nuevos serenos creados:       ${creados}`);
    console.log(`   • Serenos actualizados:         ${actualizados}`);

    // 4. Resumen final
    const total = await prisma.sereno.count();
    console.log(`   • Total serenos en cecom:       ${total}`);

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  } finally {
    await gestClient.end();
    await prisma.$disconnect();
  }
}

main();
