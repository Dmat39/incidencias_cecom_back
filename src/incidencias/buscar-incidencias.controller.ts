import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { IncidenciasService } from './incidencias.service';

/**
 * Endpoint consumido por el sistema Cazadores.
 * Devuelve la respuesta en el formato { success, message, data, total }
 * (compatible con el antiguo Laravel). Se usa @Res() para omitir el
 * ResponseInterceptor global de NestJS.
 */
@ApiTags('Buscar Incidencias')
@Controller('buscar_incidencias')
export class BuscarIncidenciasController {
  constructor(private readonly incidenciasService: IncidenciasService) {}

  @Get()
  @ApiOperation({ summary: 'Últimas 20 incidencias (para sistema Cazadores)' })
  async findAll(@Res() res: Response) {
    const data = await this.incidenciasService.buscarCodigos();
    return res.json({
      success: true,
      message: 'Últimas incidencias registradas',
      data,
      total: data.length,
    });
  }

  @Get(':codigo')
  @ApiOperation({ summary: 'Buscar incidencias por código (para sistema Cazadores)' })
  async findByCodigo(@Param('codigo') codigo: string, @Res() res: Response) {
    if (!codigo || codigo.trim() === '') {
      return res.status(400).json({ success: false, message: 'Código inválido', data: [] });
    }
    const data = await this.incidenciasService.buscarCodigos(codigo);
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontraron incidencias con el código: ${codigo}`,
        data: [],
      });
    }
    return res.json({ success: true, message: 'Incidencias encontradas', data, total: data.length });
  }
}
