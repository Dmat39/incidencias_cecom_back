import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSerenoDto } from './dto/create-sereno.dto';

@Injectable()
export class SerenosService {
  constructor(private prisma: PrismaService) {}

  async findAll(habilitado?: boolean, search?: string, page = 1, limit = 20) {
    const where: Prisma.SerenoWhereInput = {
      ...(habilitado !== undefined && { habilitado }),
      ...(search && {
        OR: [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidoPaterno: { contains: search, mode: 'insensitive' } },
          { apellidoMaterno: { contains: search, mode: 'insensitive' } },
          { dni: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.sereno.findMany({
        where,
        include: { cargoSereno: true },
        orderBy: { apellidoPaterno: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sereno.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const sereno = await this.prisma.sereno.findUnique({
      where: { id },
      include: { cargoSereno: true },
    });
    if (!sereno) throw new NotFoundException(`Sereno #${id} no encontrado`);
    return sereno;
  }

  findByCargo(cargoId: number) {
    return this.prisma.sereno.findMany({
      where: { cargoSerenoId: cargoId, habilitado: true },
      include: { cargoSereno: true },
    });
  }

  async findByDni(dni: string) {
    return this.prisma.sereno.findUnique({
      where: { dni },
      select: {
        id: true,
        dni: true,
        nombres: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        habilitado: true,
      },
    });
  }

  create(dto: CreateSerenoDto) {
    return this.prisma.sereno.create({ data: dto, include: { cargoSereno: true } });
  }

  async update(id: number, dto: Partial<CreateSerenoDto>) {
    await this.findOne(id);
    return this.prisma.sereno.update({
      where: { id },
      data: dto,
      include: { cargoSereno: true },
    });
  }

  async toggleEstado(id: number) {
    const sereno = await this.findOne(id);
    return this.prisma.sereno.update({
      where: { id },
      data: { habilitado: !sereno.habilitado },
    });
  }
}
