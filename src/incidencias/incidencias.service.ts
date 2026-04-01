import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidenciaDto } from './dto/create-incidencia.dto';
import {
  UpdateIncidenciaDto,
  UpdateEstadoDto,
  UpdateAtencionDto,
} from './dto/update-incidencia.dto';
import { FilterIncidenciaDto } from './dto/filter-incidencia.dto';
import { IncidenciasGateway } from './incidencias.gateway';
import { EvidenciasService } from 'src/evidencias/evidencias.service';

/** Retorna la fecha actual en zona horaria Lima (PET, UTC-5) como 'YYYY-MM-DD' */
function limaDate(date: Date = new Date()): string {
  return date.toLocaleString('sv-SE', { timeZone: 'America/Lima' }).split(' ')[0];
}

/** Convierte una fecha Lima 'YYYY-MM-DD' al inicio del día en UTC (00:00 PET = 05:00 UTC) */
function limaStartOfDay(dateStr: string): Date {
  return new Date(dateStr + 'T05:00:00.000Z');
}

/** Convierte una fecha Lima 'YYYY-MM-DD' al fin del día en UTC (23:59:59.999 PET = 04:59:59.999 UTC del día siguiente) */
function limaEndOfDay(dateStr: string): Date {
  const base = new Date(dateStr + 'T05:00:00.000Z');
  base.setDate(base.getDate() + 1);
  return new Date(base.getTime() - 1);
}

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
    private evidenciasService: EvidenciasService,
  ) {}

  async findAll(filters: FilterIncidenciaDto) {
    const { page = 1, limit = 20, fechaInicio, fechaFin, search, ...rest } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (fechaInicio || fechaFin) {
      where.registradoEn = {};
      // Perú = UTC-5: inicio del día 00:00 PET = 05:00 UTC; fin del día 23:59:59.999 PET = 04:59:59.999 UTC del día siguiente
      if (fechaInicio) {
        where.registradoEn.gte = new Date(fechaInicio + 'T05:00:00.000Z');
      }
      if (fechaFin) {
        const hastaBase = new Date(fechaFin + 'T05:00:00.000Z');
        hastaBase.setDate(hastaBase.getDate() + 1);
        where.registradoEn.lte = new Date(hastaBase.getTime() - 1);
      }
    }
    if (rest.situacionId) where.situacionId = rest.situacionId;
    if (rest.unidadId) where.unidadId = rest.unidadId;
    if (rest.jurisdiccionId) where.jurisdiccionId = rest.jurisdiccionId;
    if (rest.severidadId) where.severidadId = rest.severidadId;
    if (rest.medioId) where.medioId = rest.medioId;
    if (search?.trim()) {
      where.OR = [
        { codigoIncidencia: { contains: search.trim(), mode: 'insensitive' } },
        { direccion: { contains: search.trim(), mode: 'insensitive' } },
        { tipoCaso: { descripcion: { contains: search.trim(), mode: 'insensitive' } } },
        { unidad: { descripcion: { contains: search.trim(), mode: 'insensitive' } } },
      ];
    }

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
    // Default: lunes de la semana actual → hoy, calculados en zona Lima
    const todayLima = limaDate();
    const todayRef  = new Date(todayLima + 'T12:00:00Z'); // mediodía UTC del día Lima actual
    const day  = todayRef.getDay(); // 0=dom,1=lun,...
    const diff = (day === 0 ? -6 : 1 - day);
    const lunesRef = new Date(todayRef);
    lunesRef.setDate(todayRef.getDate() + diff);
    const defaultInicio = limaDate(lunesRef);
    const defaultFin    = todayLima;

    const desde = limaStartOfDay(fechaInicio || defaultInicio);
    const hasta  = limaEndOfDay(fechaFin    || defaultFin);
    const where  = { registradoEn: { gte: desde, lte: hasta } };

    const [total, grouped, groupedSev, groupedTipo, groupedSubtipo, estados, severidadesAll, recientes, allTs] = await Promise.all([
      this.prisma.incidencia.count({ where }),
      this.prisma.incidencia.groupBy({ by: ['situacionId'], where, _count: { id: true } }),
      this.prisma.incidencia.groupBy({ by: ['severidadId'], where, _count: { id: true } }),
      this.prisma.incidencia.groupBy({ by: ['tipoCasoId'], where, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 8 }),
      this.prisma.incidencia.groupBy({ by: ['subTipoCasoId'], where, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 8 }),
      this.prisma.estadoIncidencia.findMany({ select: { id: true, descripcion: true } }),
      this.prisma.severidad.findMany({ select: { id: true, descripcion: true } }),
      this.prisma.incidencia.findMany({
        where,
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, codigoIncidencia: true, direccion: true, registradoEn: true,
          tipoCaso:  { select: { descripcion: true } },
          situacion: { select: { descripcion: true } },
          severidad: { select: { descripcion: true } },
        },
      }),
      this.prisma.incidencia.findMany({ where, select: { registradoEn: true } }),
    ]);

    // Lookup tipo y subtipo por IDs encontrados
    const tipoIds    = groupedTipo.map((g) => g.tipoCasoId).filter(Boolean) as number[];
    const subtipoIds = groupedSubtipo.map((g) => g.subTipoCasoId).filter(Boolean) as number[];
    const [tipoCasos, subTipoCasos] = await Promise.all([
      tipoIds.length    ? this.prisma.tipoCaso.findMany({ where: { id: { in: tipoIds } }, select: { id: true, descripcion: true } })    : [],
      subtipoIds.length ? this.prisma.subTipoCaso.findMany({ where: { id: { in: subtipoIds } }, select: { id: true, descripcion: true } }) : [],
    ]);

    const estadoMap  = Object.fromEntries(estados.map((e) => [e.id, e.descripcion]));
    const sevMap     = Object.fromEntries(severidadesAll.map((s) => [s.id, s.descripcion]));
    const tipoMap    = Object.fromEntries(tipoCasos.map((t) => [t.id, t.descripcion]));
    const subtipoMap = Object.fromEntries(subTipoCasos.map((s) => [s.id, s.descripcion]));

    const byEstado = grouped.map((g) => ({ name: estadoMap[g.situacionId ?? 0] || 'Sin estado', value: g._count.id }));
    const sum = (keyword: string) => byEstado.filter((e) => e.name.toLowerCase().includes(keyword)).reduce((acc, e) => acc + e.value, 0);

    const bySeveridad = groupedSev
      .filter((g) => g.severidadId)
      .map((g) => ({ name: sevMap[g.severidadId!] || 'Sin severidad', value: g._count.id }))
      .sort((a, b) => b.value - a.value);

    const byTipoCaso = groupedTipo
      .filter((g) => g.tipoCasoId)
      .map((g) => ({ name: tipoMap[g.tipoCasoId!] || 'Sin tipo', value: g._count.id }));

    const bySubTipoCaso = groupedSubtipo
      .filter((g) => g.subTipoCasoId)
      .map((g) => ({ name: subtipoMap[g.subTipoCasoId!] || 'Sin subtipo', value: g._count.id }));

    // Por turno (hora Lima)
    let mañana = 0, tarde = 0, noche = 0;
    allTs.forEach(({ registradoEn }) => {
      if (!registradoEn) return;
      const hora = parseInt(registradoEn.toLocaleString('sv-SE', { timeZone: 'America/Lima' }).slice(11, 13), 10);
      if (hora >= 6 && hora < 14) mañana++;
      else if (hora >= 14 && hora < 22) tarde++;
      else noche++;
    });

    // Tendencia diaria
    const tendenciaMap = new Map<string, number>();
    allTs.forEach(({ registradoEn }) => {
      if (!registradoEn) return;
      const fecha = limaDate(registradoEn);
      tendenciaMap.set(fecha, (tendenciaMap.get(fecha) || 0) + 1);
    });
    const tendencia = Array.from(tendenciaMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, total]) => ({ fecha, total }));

    return {
      total,
      pendientes: sum('pendiente'),
      enAtencion: sum('atenci'),
      atendidas:  sum('atendida'),
      byEstado,
      bySeveridad,
      byTipoCaso,
      bySubTipoCaso,
      porTurno: { mañana, tarde, noche },
      tendencia,
      recientes,
    };
  }

  async findMapa(fechaInicio?: string, fechaFin?: string, turno?: string) {
    const desdeDia = fechaInicio || limaDate();
    const hastaDia = fechaFin   || limaDate();

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
      // cursor = inicio del día Lima (00:00 PET = 05:00 UTC)
      const cursor = limaStartOfDay(desdeDia);
      const limit  = limaStartOfDay(hastaDia);

      while (cursor <= limit) {
        const H = 60 * 60 * 1000;
        if (turno === 'mañana') {
          // 06:00–13:59:59.999 PET = cursor+6h a cursor+14h-1ms
          ranges.push({ gte: new Date(cursor.getTime() + 6 * H), lte: new Date(cursor.getTime() + 14 * H - 1) });
        } else if (turno === 'tarde') {
          // 14:00–21:59:59.999 PET = cursor+14h a cursor+22h-1ms
          ranges.push({ gte: new Date(cursor.getTime() + 14 * H), lte: new Date(cursor.getTime() + 22 * H - 1) });
        } else {
          // 22:00–05:59:59.999 PET = cursor+22h a cursor+30h-1ms
          ranges.push({ gte: new Date(cursor.getTime() + 22 * H), lte: new Date(cursor.getTime() + 30 * H - 1) });
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
          gte: limaStartOfDay(desdeDia),
          lte: limaEndOfDay(hastaDia),
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

    let incidencia: any;
    try {
      incidencia = await this.prisma.incidencia.create({
        data: {
          ...dto,
          ocurridoEn: dto.ocurridoEn ? new Date(dto.ocurridoEn + '-05:00') : undefined,
          codigoIncidencia,
          usuarioId,
          registradoEn: new Date(),
        },
        include: INCLUDE_INCIDENCIA,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Ya existe una incidencia con ese código. Por favor intente nuevamente.');
      }
      throw new InternalServerErrorException('Error al registrar la incidencia. Intente nuevamente.');
    }

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

  async getMetricasOperadores(fechaInicio?: string, fechaFin?: string) {
    const todayLima = limaDate();
    const desde = limaStartOfDay(fechaInicio || todayLima);
    const hasta  = limaEndOfDay(fechaFin    || todayLima);
    const where  = { registradoEn: { gte: desde, lte: hasta } };

    // Traer todas las incidencias del rango con datos necesarios
    const incidencias = await this.prisma.incidencia.findMany({
      where,
      select: {
        usuarioId: true,
        severidadId: true,
        situacionId: true,
        registradoEn: true,
      },
    });

    if (!incidencias.length) return { operadores: [], totalPeriodo: 0 };

    // Calcular días en el rango para promedio diario
    const diasRango = Math.max(1, Math.ceil((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24)));

    // Agrupar por usuario
    const mapaUsuario = new Map<number, {
      total: number;
      porSeveridad: Record<number, number>;
      porSituacion: Record<number, number>;
      porTurno: { mañana: number; tarde: number; noche: number };
    }>();

    incidencias.forEach(({ usuarioId, severidadId, situacionId, registradoEn }) => {
      if (!usuarioId) return;
      if (!mapaUsuario.has(usuarioId)) {
        mapaUsuario.set(usuarioId, { total: 0, porSeveridad: {}, porSituacion: {}, porTurno: { mañana: 0, tarde: 0, noche: 0 } });
      }
      const entry = mapaUsuario.get(usuarioId)!;
      entry.total++;
      if (severidadId) entry.porSeveridad[severidadId] = (entry.porSeveridad[severidadId] || 0) + 1;
      if (situacionId) entry.porSituacion[situacionId] = (entry.porSituacion[situacionId] || 0) + 1;
      if (registradoEn) {
        const hora = parseInt(registradoEn.toLocaleString('sv-SE', { timeZone: 'America/Lima' }).slice(11, 13), 10);
        if (hora >= 6 && hora < 14) entry.porTurno.mañana++;
        else if (hora >= 14 && hora < 22) entry.porTurno.tarde++;
        else entry.porTurno.noche++;
      }
    });

    // Obtener datos de usuarios
    const usuarioIds = Array.from(mapaUsuario.keys());
    const [usuarios, severidades, situaciones] = await Promise.all([
      this.prisma.usuario.findMany({
        where: { id: { in: usuarioIds } },
        select: { id: true, nombres: true, apellidos: true, username: true },
      }),
      this.prisma.severidad.findMany({ select: { id: true, descripcion: true } }),
      this.prisma.estadoIncidencia.findMany({ select: { id: true, descripcion: true } }),
    ]);

    const sevMap  = Object.fromEntries(severidades.map((s) => [s.id, s.descripcion ?? 'Sin nombre']));
    const sitMap  = Object.fromEntries(situaciones.map((s) => [s.id, s.descripcion ?? 'Sin nombre']));
    const usuMap  = Object.fromEntries(usuarios.map((u) => [u.id, u]));

    const operadores = usuarioIds
      .map((uid) => {
        const entry = mapaUsuario.get(uid)!;
        const usuario = usuMap[uid];
        if (!usuario) return null;
        return {
          id: uid,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          username: usuario.username,
          total: entry.total,
          promedioDiario: parseFloat((entry.total / diasRango).toFixed(1)),
          porSeveridad: Object.entries(entry.porSeveridad).map(([id, count]) => ({ nombre: sevMap[Number(id)] || 'Desconocida', count })),
          porSituacion: Object.entries(entry.porSituacion).map(([id, count]) => ({ nombre: sitMap[Number(id)] || 'Desconocido', count })),
          porTurno: entry.porTurno,
        };
      })
      .filter((op): op is NonNullable<typeof op> => op !== null)
      .sort((a, b) => b.total - a.total);

    return {
      operadores,
      totalPeriodo: incidencias.length,
      diasRango,
    };
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
