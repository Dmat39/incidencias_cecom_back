import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvidenciasService {
  constructor(private prisma: PrismaService) {}

  async create(incidenciaId: number, file: Express.Multer.File, usuarioId: number) {
    const incidencia = await this.prisma.incidencia.findUnique({
      where: { id: incidenciaId },
    });
    if (!incidencia) throw new NotFoundException(`Incidencia #${incidenciaId} no encontrada`);

    return this.prisma.evidencia.create({
      data: {
        incidenciaId,
        usuarioId,
        nombreArchivo: file.originalname,
        rutaArchivo: file.path,
        fechaHoraRegistro: new Date(),
      },
    });
  }

  findByIncidencia(incidenciaId: number) {
    return this.prisma.evidencia.findMany({
      where: { incidenciaId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: number) {
    const evidencia = await this.prisma.evidencia.findUnique({ where: { id } });
    if (!evidencia) throw new NotFoundException(`Evidencia #${id} no encontrada`);
    return this.prisma.evidencia.delete({ where: { id } });
  }
}
