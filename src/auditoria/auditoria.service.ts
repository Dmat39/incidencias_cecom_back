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

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditoriaUsuario.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditoriaUsuario.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
