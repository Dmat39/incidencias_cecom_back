import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async generarExcelIncidencias(filters: {
    fechaInicio?: string;
    fechaFin?: string;
    situacionId?: number;
    unidadId?: number;
  }): Promise<Buffer> {
    const where: any = {};
    if (filters.fechaInicio || filters.fechaFin) {
      where.registradoEn = {};
      if (filters.fechaInicio) where.registradoEn.gte = new Date(filters.fechaInicio);
      if (filters.fechaFin) where.registradoEn.lte = new Date(filters.fechaFin);
    }
    if (filters.situacionId) where.situacionId = filters.situacionId;
    if (filters.unidadId) where.unidadId = filters.unidadId;

    const incidencias = await this.prisma.incidencia.findMany({
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

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Incidencias');

    sheet.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Fecha Registro', key: 'fechaRegistro', width: 20 },
      { header: 'Unidad', key: 'unidad', width: 15 },
      { header: 'Tipo Caso', key: 'tipoCaso', width: 20 },
      { header: 'Subtipo', key: 'subTipoCaso', width: 20 },
      { header: 'Descripción', key: 'descripcion', width: 40 },
      { header: 'Dirección', key: 'direccion', width: 30 },
      { header: 'Jurisdicción', key: 'jurisdiccion', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Severidad', key: 'severidad', width: 12 },
      { header: 'Medio', key: 'medio', width: 12 },
      { header: 'Reportante', key: 'reportante', width: 20 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Operador', key: 'operador', width: 15 },
      { header: 'Usuario', key: 'usuario', width: 15 },
    ];

    // Estilo de cabecera
    sheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A5F' },
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { horizontal: 'center' };
    });

    incidencias.forEach((inc) => {
      sheet.addRow({
        codigo: inc.codigoIncidencia ?? '',
        fechaRegistro: inc.registradoEn?.toISOString() ?? '',
        unidad: inc.unidad?.descripcion ?? '',
        tipoCaso: inc.tipoCaso?.descripcion ?? '',
        subTipoCaso: inc.subTipoCaso?.descripcion ?? '',
        descripcion: inc.descripcion ?? '',
        direccion: inc.direccion ?? '',
        jurisdiccion: inc.jurisdiccion?.nombre ?? '',
        estado: inc.situacion?.descripcion ?? '',
        severidad: inc.severidad?.descripcion ?? '',
        medio: inc.medio?.descripcion ?? '',
        reportante: inc.nombreReportante ?? '',
        telefono: inc.telefonoReportante ?? '',
        operador: inc.operador?.descripcion ?? '',
        usuario: [inc.usuario?.nombres, inc.usuario?.apellidos].filter(Boolean).join(' ') ?? '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
