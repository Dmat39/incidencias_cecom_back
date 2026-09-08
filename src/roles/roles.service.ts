import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SELECT_ROL = {
  id: true,
  nombre: true,
  descripcion: true,
  permisos: {
    select: {
      permiso: { select: { id: true, nombre: true, descripcion: true } },
    },
    orderBy: { permiso: { nombre: 'asc' } } as any,
  },
  jurisdicciones: {
    select: {
      jurisdiccion: { select: { id: true, nombre: true, codigo: true } },
    },
    orderBy: { jurisdiccion: { nombre: 'asc' } } as any,
  },
  _count: { select: { usuarios: true } },
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.rol.findMany({ select: SELECT_ROL, orderBy: { nombre: 'asc' } });
  }

  async findOne(id: number) {
    const rol = await this.prisma.rol.findUnique({ where: { id }, select: SELECT_ROL });
    if (!rol) throw new NotFoundException(`Rol #${id} no encontrado`);
    return rol;
  }

  async create(dto: { nombre: string; descripcion?: string; permisoIds?: number[] }) {
    const nombre = dto.nombre.toLowerCase().trim();
    // Se compara ya normalizado: si no, crear 'SDAS' no detecta el 'sdas'
    // existente y revienta más abajo con un error crudo de Prisma.
    const exists = await this.prisma.rol.findFirst({ where: { nombre } });
    if (exists) throw new ConflictException(`El rol '${nombre}' ya existe`);

    return this.prisma.rol.create({
      data: {
        nombre,
        descripcion: dto.descripcion,
        permisos: dto.permisoIds?.length
          ? { create: dto.permisoIds.map((permisoId) => ({ permisoId })) }
          : undefined,
      },
      select: SELECT_ROL,
    });
  }

  async update(id: number, dto: { nombre?: string; descripcion?: string }) {
    await this.findOne(id);
    const data: any = {};
    if (dto.nombre !== undefined) {
      const nombre = dto.nombre.toLowerCase().trim();
      const exists = await this.prisma.rol.findFirst({
        where: { nombre, NOT: { id } },
      });
      if (exists) throw new ConflictException(`El rol '${nombre}' ya existe`);
      data.nombre = nombre;
    }
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion;
    return this.prisma.rol.update({ where: { id }, data, select: SELECT_ROL });
  }

  async remove(id: number) {
    const rol = await this.prisma.rol.findUnique({
      where: { id },
      include: { _count: { select: { usuarios: true } } },
    });
    if (!rol) throw new NotFoundException(`Rol #${id} no encontrado`);
    if ((rol as any)._count.usuarios > 0) {
      throw new ConflictException(
        `No se puede eliminar: hay ${(rol as any)._count.usuarios} usuario(s) con este rol`,
      );
    }
    await this.prisma.rolPermiso.deleteMany({ where: { rolId: id } });
    return this.prisma.rol.delete({ where: { id } });
  }

  async asignarPermisos(id: number, permisoIds: number[]) {
    await this.findOne(id);
    await this.prisma.rolPermiso.deleteMany({ where: { rolId: id } });
    if (permisoIds.length) {
      await this.prisma.rolPermiso.createMany({
        data: permisoIds.map((permisoId) => ({ rolId: id, permisoId })),
        skipDuplicates: true,
      });
    }
    return this.findOne(id);
  }

  async asignarJurisdicciones(id: number, jurisdiccionIds: number[]) {
    await this.findOne(id);
    await this.prisma.rolJurisdiccion.deleteMany({ where: { rolId: id } });
    if (jurisdiccionIds.length) {
      await this.prisma.rolJurisdiccion.createMany({
        data: jurisdiccionIds.map((jurisdiccionId) => ({ rolId: id, jurisdiccionId })),
        skipDuplicates: true,
      });
    }
    return this.findOne(id);
  }

  findAllPermisos() {
    return this.prisma.permiso.findMany({ orderBy: { nombre: 'asc' } });
  }
}
