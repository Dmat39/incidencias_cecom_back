import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as turf from '@turf/turf';
import { PrismaService } from '../prisma/prisma.service';

function fmtLima(date: Date | null | undefined): string {
  if (!date) return '';
  return date.toLocaleString('sv-SE', { timeZone: 'America/Lima' });
}

function getTurno(date: Date | null | undefined): string {
  if (!date) return '';
  const hora = parseInt(date.toLocaleString('sv-SE', { timeZone: 'America/Lima' }).slice(11, 13), 10);
  if (hora >= 6 && hora < 14)  return 'Mañana';
  if (hora >= 14 && hora < 22) return 'Tarde';
  return 'Noche';
}

type IncidenciaConRelaciones = Awaited<
  ReturnType<ReportesService['queryIncidencias']>
>[number];

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  private async queryIncidencias(where: object) {
    return this.prisma.incidencia.findMany({
      where,
      include: {
        unidad: true,
        tipoCaso: true,
        subTipoCaso: true,
        tipoReportante: true,
        severidad: true,
        jurisdiccion: true,
        situacion: true,
        medio: true,
        operador: true,
        usuario: { select: { nombres: true, apellidos: true } },
      },
      orderBy: { registradoEn: 'asc' },
    });
  }

  private buildWhereFechas(fechaInicio?: string, fechaFin?: string): object {
    const where: any = {};
    if (fechaInicio || fechaFin) {
      where.registradoEn = {};
      if (fechaInicio) where.registradoEn.gte = new Date(fechaInicio + 'T05:00:00.000Z');
      if (fechaFin) {
        const hasta = new Date(fechaFin + 'T05:00:00.000Z');
        hasta.setDate(hasta.getDate() + 1);
        where.registradoEn.lte = new Date(hasta.getTime() - 1);
      }
    }
    return where;
  }

  private async buildExcel(incidencias: IncidenciaConRelaciones[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Incidencias');

    sheet.columns = [
      { header: 'Código',         key: 'codigo',        width: 15 },
      { header: 'Fecha Registro', key: 'fechaRegistro', width: 20 },
      { header: 'Turno',          key: 'turno',         width: 12 },
      { header: 'Unidad',         key: 'unidad',        width: 15 },
      { header: 'Tipo Caso',      key: 'tipoCaso',      width: 20 },
      { header: 'Subtipo',        key: 'subTipoCaso',   width: 20 },
      { header: 'Descripción',    key: 'descripcion',   width: 40 },
      { header: 'Dirección',      key: 'direccion',     width: 30 },
      { header: 'Coordenadas',    key: 'coordenadas',   width: 28 },
      { header: 'Jurisdicción',   key: 'jurisdiccion',  width: 15 },
      { header: 'Estado',         key: 'estado',        width: 15 },
      { header: 'Severidad',      key: 'severidad',     width: 12 },
      { header: 'Medio',          key: 'medio',         width: 12 },
      { header: 'Reportante',     key: 'reportante',    width: 20 },
      { header: 'Teléfono',       key: 'telefono',      width: 15 },
      { header: 'Operador',       key: 'operador',      width: 15 },
      { header: 'Usuario',        key: 'usuario',       width: 15 },
    ];

    sheet.getRow(1).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { horizontal: 'center' };
    });

    incidencias.forEach((inc) => {
      sheet.addRow({
        codigo:        inc.codigoIncidencia ?? '',
        fechaRegistro: fmtLima(inc.registradoEn),
        turno:         getTurno(inc.registradoEn),
        unidad:        inc.unidad?.descripcion ?? '',
        tipoCaso:      inc.tipoCaso?.descripcion ?? '',
        subTipoCaso:   inc.subTipoCaso?.descripcion ?? '',
        descripcion:   inc.descripcion ?? '',
        direccion:     inc.direccion ?? '',
        coordenadas:   inc.latitud != null && inc.longitud != null
          ? `${Number(inc.latitud)}, ${Number(inc.longitud)}`
          : '',
        jurisdiccion:  inc.jurisdiccion?.nombre ?? '',
        estado:        inc.situacion?.descripcion ?? '',
        severidad:     inc.severidad?.descripcion ?? '',
        medio:         inc.medio?.descripcion ?? '',
        reportante:    inc.nombreReportante   || 'No registra',
        telefono:      inc.telefonoReportante || 'No registra teléfono',
        operador:      inc.operador?.descripcion ?? '',
        usuario:       [inc.usuario?.nombres, inc.usuario?.apellidos].filter(Boolean).join(' '),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generarExcelIncidencias(filters: {
    fechaInicio?: string;
    fechaFin?: string;
    situacionId?: number;
    unidadId?: number;
    tipoCasoId?: number;
    subTipoCasoId?: number;
  }): Promise<Buffer> {
    const where: any = this.buildWhereFechas(filters.fechaInicio, filters.fechaFin);
    if (filters.situacionId)  where.situacionId  = filters.situacionId;
    if (filters.unidadId)     where.unidadId     = filters.unidadId;
    if (filters.tipoCasoId)   where.tipoCasoId   = filters.tipoCasoId;
    if (filters.subTipoCasoId) where.subTipoCasoId = filters.subTipoCasoId;

    const incidencias = await this.queryIncidencias(where);
    return this.buildExcel(incidencias);
  }

  async generarExcelZona(dto: {
    fechaInicio?: string;
    fechaFin?: string;
    polygon: [number, number][];
  }): Promise<Buffer> {
    // Only fetch incidents that have coordinates
    const where: any = {
      ...this.buildWhereFechas(dto.fechaInicio, dto.fechaFin),
      latitud:  { not: null },
      longitud: { not: null },
    };

    const incidencias = await this.queryIncidencias(where);

    // Close ring if needed and build turf polygon
    const coords = dto.polygon;
    const first = coords[0];
    const last  = coords[coords.length - 1];
    const ring  = first[0] === last[0] && first[1] === last[1]
      ? coords
      : [...coords, first];
    const polygon = turf.polygon([ring]);

    // Filter: only incidents whose coordinates fall inside the polygon
    const filtradas = incidencias.filter((inc) => {
      const pt = turf.point([Number(inc.longitud), Number(inc.latitud)]);
      return turf.booleanPointInPolygon(pt, polygon);
    });

    return this.buildExcel(filtradas);
  }
}
