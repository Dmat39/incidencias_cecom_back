import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RutasService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.ruta.findMany({
      include: { unidad: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  findByUnidad(unidadId: number) {
    return this.prisma.ruta.findMany({
      where: { unidadId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  findCoordenadasByUnidad(unidadId: number) {
    return this.prisma.ruta.findMany({
      where: { unidadId },
      select: { latitud: true, longitud: true, hora: true, fecha: true },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
  }

  create(data: { latitud?: number; longitud?: number; unidadId?: number; hora?: string }) {
    return this.prisma.ruta.create({
      data: {
        ...data,
        fecha: new Date(),
      },
    });
  }
}
