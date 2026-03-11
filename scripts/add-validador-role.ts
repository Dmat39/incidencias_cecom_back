import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rol = await prisma.rol.upsert({
    where: { nombre: 'validador' },
    update: {},
    create: { nombre: 'validador', descripcion: 'Validador SVI' },
  });
  console.log('✅ Rol creado/verificado:', rol);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
