import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidenciaDto } from './dto/create-incidencia.dto';
import {
  UpdateIncidenciaDto,
  UpdateEstadoDto,
  UpdateAtencionDto,
} from './dto/update-incidencia.dto';
import { FilterIncidenciaDto } from './dto/filter-incidencia.dto';
import { IncidenciasGateway } from './incidencias.gateway';

const PREFIJOS: Record<number, string> = {
  1: 'R',
  2: 'G',
  3: 'T',
  4: 'C',
  7: 'R',
  8: 'WA',
  9: 'BP',
};

const INCLUDE_INCIDENCIA = {
  unidad: true,
  tipoCaso: true,
  subTipoCaso: true,
  tipoReportante: true,
  severidad: true,
  jurisdiccion: true,
  situacion: true,
  medio: true,
  operador: true,
  usuario: { select: { id: true, nombres: true, apellidos: true, username: true } },
  estadoProceso: true,
  generoAgresor: true,
  generoVictima: true,
  severidadProceso: true,
  serenos: { include: { sereno: true } },
  evidencias: true,
};

@Injectable()
export class IncidenciasService {
  constructor(
    private prisma: PrismaService,
    private gateway: IncidenciasGateway,
  ) {}

  async findAll(filters: FilterIncidenciaDto) {
    const { page = 1, limit = 20, fechaInicio, fechaFin, ...rest } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (fechaInicio || fechaFin) {
      where.registradoEn = {};
      if (fechaInicio) where.registradoEn.gte = new Date(fechaInicio);
      if (fechaFin) where.registradoEn.lte = new Date(fechaFin);
    }
    if (rest.situacionId) where.situacionId = rest.situacionId;
    if (rest.unidadId) where.unidadId = rest.unidadId;
    if (rest.jurisdiccionId) where.jurisdiccionId = rest.jurisdiccionId;
    if (rest.medioId) where.medioId = rest.medioId;

    const [data, total] = await Promise.all([
      this.prisma.incidencia.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: INCLUDE_INCIDENCIA,
      }),
      this.prisma.incidencia.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const inc = await this.prisma.incidencia.findUnique({
      where: { id },
      include: INCLUDE_INCIDENCIA,
    });
    if (!inc) throw new NotFoundException(`Incidencia #${id} no encontrada`);
    return inc;
  }

  async findByCodigo(codigo: string) {
    const inc = await this.prisma.incidencia.findUnique({
      where: { codigoIncidencia: codigo },
      include: INCLUDE_INCIDENCIA,
    });
    if (!inc) throw new NotFoundException(`Incidencia ${codigo} no encontrada`);
    return inc;
  }

  async getDashboardStats(fechaInicio?: string, fechaFin?: string) {
    // Default: lunes de la semana actual → hoy
    const now   = new Date();
    const day   = now.getDay(); // 0=dom,1=lun,...
    const diff  = (day === 0 ? -6 : 1 - day); // días hasta el lunes
    const lunes = new Date(now);
    lunes.setDate(now.getDate() + diff);

    const defaultInicio = lunes.toISOString().split('T')[0];
    const defaultFin    = now.toISOString().split('T')[0];

    const desde = new Date((fechaInicio || defaultInicio) + 'T00:00:00.000Z');
    const hasta  = new Date((fechaFin    || defaultFin)   + 'T23:59:59.999Z');
    const where  = { registradoEn: { gte: desde, lte: hasta } };

    const [total, grouped, estados, recientes] = await Promise.all([
      this.prisma.incidencia.count({ where }),
      this.prisma.incidencia.groupBy({
        by: ['situacionId'],
        where,
        _count: { id: true },
      }),
      this.prisma.estadoIncidencia.findMany({ select: { id: true, descripcion: true } }),
      this.prisma.incidencia.findMany({
        where,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          codigoIncidencia: true,
          direccion: true,
          registradoEn: true,
          tipoCaso:  { select: { descripcion: true } },
          situacion: { select: { descripcion: true } },
        },
      }),
    ]);

    const estadoMap = Object.fromEntries(estados.map((e) => [e.id, e.descripcion]));

    const byEstado = grouped.map((g) => ({
      name:  estadoMap[g.situacionId ?? 0] || 'Sin estado',
      value: g._count.id,
    }));

    const sum = (keyword: string) =>
      byEstado
        .filter((e) => e.name.toLowerCase().includes(keyword))
        .reduce((acc, e) => acc + e.value, 0);

    return {
      total,
      pendientes: sum('pendiente'),
      enAtencion: sum('atenci'),
      atendidas:  sum('atendida'),
      byEstado,
      recientes,
    };
  }

  async findMapa(fechaInicio?: string, fechaFin?: string, turno?: string) {
    const today = new Date().toISOString().split('T')[0];
    const desdeDia = fechaInicio || today;
    const hastaDia = fechaFin   || today;

    const SELECT = {
      id: true,
      codigoIncidencia: true,
      latitud: true,
      longitud: true,
      situacionId: true,
      situacion: { select: { descripcion: true } },
      tipoCaso: { select: { descripcion: true } },
      registradoEn: true,
    };

    const BASE = { latitud: { not: null }, longitud: { not: null } };

    if (turno === 'mañana' || turno === 'tarde' || turno === 'noche') {
      const ranges: Array<{ gte: Date; lte: Date }> = [];
      const cursor = new Date(desdeDia + 'T00:00:00');
      const limit  = new Date(hastaDia + 'T00:00:00');

      while (cursor <= limit) {
        const y  = cursor.getFullYear();
        const m  = String(cursor.getMonth() + 1).padStart(2, '0');
        const d  = String(cursor.getDate()).padStart(2, '0');
        const dia = `${y}-${m}-${d}`;

        if (turno === 'mañana') {
          ranges.push({ gte: new Date(`${dia}T06:00:00`), lte: new Date(`${dia}T13:59:59.999`) });
        } else if (turno === 'tarde') {
          ranges.push({ gte: new Date(`${dia}T14:00:00`), lte: new Date(`${dia}T21:59:59.999`) });
        } else {
          const next = new Date(cursor);
          next.setDate(next.getDate() + 1);
          const yn = next.getFullYear();
          const mn = String(next.getMonth() + 1).padStart(2, '0');
          const dn = String(next.getDate()).padStart(2, '0');
          ranges.push({ gte: new Date(`${dia}T22:00:00`), lte: new Date(`${yn}-${mn}-${dn}T05:59:59.999`) });
        }
        cursor.setDate(cursor.getDate() + 1);
      }

      return this.prisma.incidencia.findMany({
        where: { ...BASE, OR: ranges.map((r) => ({ registradoEn: r })) },
        select: SELECT,
      });
    }

    return this.prisma.incidencia.findMany({
      where: {
        ...BASE,
        registradoEn: {
          gte: new Date(desdeDia + 'T00:00:00'),
          lte: new Date(hastaDia + 'T23:59:59.999'),
        },
      },
      select: SELECT,
    });
  }

  async findCalor() {
    return this.prisma.incidencia.findMany({
      where: { latitud: { not: null }, longitud: { not: null } },
      select: { latitud: true, longitud: true },
    });
  }

  async create(dto: CreateIncidenciaDto, usuarioId: number) {
    const codigoIncidencia = await this.generarCodigo(dto.medioId);

    const incidencia = await this.prisma.incidencia.create({
      data: {
        ...dto,
        ocurridoEn: dto.ocurridoEn ? new Date(dto.ocurridoEn + '-05:00') : undefined,
        codigoIncidencia,
        usuarioId,
        registradoEn: new Date(),
      },
      include: INCLUDE_INCIDENCIA,
    });

    this.gateway.emitNuevaIncidencia(incidencia);
    return incidencia;
  }

  async update(id: number, dto: UpdateIncidenciaDto) {
    await this.findOne(id);
    const incidencia = await this.prisma.incidencia.update({
      where: { id },
      data: dto as any,
      include: INCLUDE_INCIDENCIA,
    });
    this.gateway.emitIncidenciaActualizada(incidencia);
    return incidencia;
  }

  async updateEstado(id: number, dto: UpdateEstadoDto) {
    await this.findOne(id);
    const incidencia = await this.prisma.incidencia.update({
      where: { id },
      data: dto,
      include: INCLUDE_INCIDENCIA,
    });
    this.gateway.emitIncidenciaActualizada(incidencia);
    return incidencia;
  }

  async updateAtencion(id: number, dto: UpdateAtencionDto) {
    await this.findOne(id);
    const incidencia = await this.prisma.incidencia.update({
      where: { id },
      data: {
        ...dto,
        atendidoEn: dto.atendidoEn ? new Date(dto.atendidoEn) : undefined,
      },
      include: INCLUDE_INCIDENCIA,
    });
    this.gateway.emitIncidenciaAtendida(incidencia);
    return incidencia;
  }

  async updateSerenos(id: number, serenosIds: number[]) {
    await this.findOne(id);
    await this.prisma.incidenciaSereno.deleteMany({ where: { incidenciaId: id } });
    if (serenosIds?.length) {
      await this.prisma.incidenciaSereno.createMany({
        data: (serenosIds ?? []).map((serenoId) => ({ incidenciaId: id, serenoId })),
        skipDuplicates: true,
      });
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.incidencia.delete({ where: { id } });
  }

  async buscarCodigos(codigo?: string) {
    const where = codigo?.trim()
      ? { codigoIncidencia: { contains: codigo.trim(), mode: 'insensitive' as const } }
      : {};
    const data = await this.prisma.incidencia.findMany({
      where,
      orderBy: { registradoEn: 'desc' },
      take: 20,
      select: { id: true, codigoIncidencia: true, latitud: true, longitud: true },
    });
    return data;
  }

  async generarCodigo(medioId?: number): Promise<string> {
    const prefijo = medioId ? (PREFIJOS[medioId] ?? 'I') : 'I';
    const anio = new Date().getFullYear();
    const seqName = `seq_incidencia_${prefijo}_${anio}`;

    // Crear secuencia si no existe (idempotente)
    await this.prisma.$executeRawUnsafe(
      `CREATE SEQUENCE IF NOT EXISTS "${seqName}" START 1`,
    );

    const result = (await this.prisma.$queryRawUnsafe(
      `SELECT nextval('"${seqName}"')`,
    )) as [{ nextval: bigint }];

    const correlativo = result[0].nextval.toString().padStart(5, '0');
    return `${prefijo}${anio}${correlativo}`;
  }
}
