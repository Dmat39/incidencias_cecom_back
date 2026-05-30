import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportesService } from './reportes.service';

@ApiTags('Reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'operador', 'validador')
@Controller('reportes')
export class ReportesController {
  constructor(private reportesService: ReportesService) {}

  @Post('excel')
  @ApiOperation({ summary: 'Generar reporte Excel de incidencias' })
  async generarExcel(
    @Body()
    filters: {
      fechaInicio?: string;
      fechaFin?: string;
      situacionId?: number;
      unidadId?: number;
      tipoCasoId?: number;
      subTipoCasoId?: number;
    },
    @Res() res: Response,
  ) {
    const buffer = await this.reportesService.generarExcelIncidencias(filters);
    const filename = `incidencias_${Date.now()}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Post('excel-zona')
  @Roles('admin')
  @ApiOperation({ summary: 'Generar reporte Excel filtrado por perímetro geográfico' })
  async generarExcelZona(
    @Body()
    dto: {
      fechaInicio?: string;
      fechaFin?: string;
      polygon: [number, number][];
    },
    @Res() res: Response,
  ) {
    const buffer = await this.reportesService.generarExcelZona(dto);
    const fecha = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Lima' });
    const filename = `reporte_zona_${fecha}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}
