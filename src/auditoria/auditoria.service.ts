import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AccionAuditoria = 'CREAR' | 'EDITAR' | 'ELIMINAR';

@Injectable()
export class AuditoriaService {
  constructor(private prisma: PrismaService) {}

  async registrar(params: {
    modulo: string;
    accion: AccionAuditoria;
    usuarioAfectadoId?: number;
    usuarioAfectado: string;
    realizadoPorId?: number;
    realizadoPor: string;
    detalles?: Record<string, any>;
  }) {
    return this.prisma.auditoriaUsuario.create({ data: params });
  }

  async findAll(page = 1, limit = 20, modulo?: string, search?: string, accion?: string) {
    const skip = (page - 1) * limit;

    const conditions: any[] = [];
    if (modulo) conditions.push({ modulo: { contains: modulo, mode: 'insensitive' } });
    if (accion) conditions.push({ accion });
    if (search) {
      conditions.push({
        OR: [
          { usuarioAfectado: { contains: search, mode: 'insensitive' } },
          { realizadoPor:    { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where = conditions.length ? { AND: conditions } : {};

    const [data, total] = await Promise.all([
      this.prisma.auditoriaUsuario.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditoriaUsuario.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
