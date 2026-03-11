import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { SerenosService } from './serenos.service';

/**
 * Endpoint público consumido por el sistema Cazadores.
 * No requiere autenticación JWT.
 */
@ApiTags('Buscar Sereno por DNI')
@Controller('serenos/buscar-dni')
export class BuscarSerenoController {
  constructor(private readonly serenosService: SerenosService) {}

  @Get(':dni')
  @ApiOperation({ summary: 'Buscar sereno por DNI (para sistema Cazadores)' })
  async findByDni(@Param('dni') dni: string, @Res() res: Response) {
    if (!dni || !/^\d{8}$/.test(dni)) {
      return res.status(400).json({ success: false, message: 'DNI inválido, debe tener 8 dígitos', data: null });
    }
    const sereno = await this.serenosService.findByDni(dni);
    if (!sereno) {
      return res.status(404).json({ success: false, message: 'DNI no registrado en serenos', data: null });
    }
    return res.json({ success: true, message: 'Sereno encontrado', data: sereno });
  }
}
