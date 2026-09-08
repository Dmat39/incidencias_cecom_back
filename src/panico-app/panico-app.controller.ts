import {
  Controller, Post, Get, Patch, Body, Param, Query,
  HttpCode, UseGuards, Headers, UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PanicoAppService } from './panico-app.service';

export class CrearIncidenciaDto {
  @IsNumber()
  @Type(() => Number)
  tipoCasoId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  subTipoCasoId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  operadorId?: number;
}

// Mantenemos PanicoAlertaDto exportado para compatibilidad de tipos aunque ya no se use en el endpoint
export class PanicoAlertaDto {}

@Controller('panico-app')
export class PanicoAppController {
  constructor(private readonly service: PanicoAppService) {}

  /**
   * Webhook llamado por panico-backend cuando se crea una nueva alerta.
   * No requiere JWT — autenticado con x-api-key (PANICO_API_KEY).
   */
  @Post('webhook/nueva-alerta')
  @HttpCode(200)
  webhookNuevaAlerta(
    @Headers('x-api-key') apiKey: string,
    @Body() body: { alertaId: number },
  ) {
    const expected = process.env.PANICO_API_KEY;
    if (expected && apiKey !== expected) throw new UnauthorizedException('API key inválida');
    this.service.procesarWebhookNuevaAlerta(body.alertaId);
    return { ok: true };
  }

  /** Listado paginado de alertas del botón de pánico (proxy a panico-backend) */
  @Get('alertas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermiso('alertas')
  @ApiBearerAuth()
  async listarAlertas(
    @CurrentUser() user: { id: number; username: string },
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('fecha') fecha?: string,
    @Query('estado') estado?: string,
  ) {
    return this.service.listarAlertas(+page, +limit, fecha, estado, user.id);
  }

  /** Crea una incidencia CECOM manualmente a partir de una alerta del botón de pánico */
  @Post('alertas/:id/incidencia')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermiso('alertas')
  @ApiBearerAuth()
  async crearIncidencia(
    @Param('id') id: string,
    @Body() dto: CrearIncidenciaDto,
  ) {
    return this.service.crearIncidenciaManual(+id, dto.tipoCasoId, dto.subTipoCasoId, dto.operadorId);
  }

  /** Estadísticas para el dashboard */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermiso('alertas')
  @ApiBearerAuth()
  async obtenerStats() {
    return this.service.obtenerStats();
  }

  /** Cambia el estado de una alerta en panico-backend (proxy autenticado) */
  @Patch('alertas/:id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermiso('alertas')
  @ApiBearerAuth()
  async cambiarEstado(
    @Param('id') id: string,
    @Body() body: { estado: string; operadorRef?: string },
    @CurrentUser() user: { id: number; username: string },
  ) {
    return this.service.cambiarEstadoAlerta(+id, body.estado, body.operadorRef ?? user.username, user.username);
  }

  /** Bloquea un usuario de la app por su DNI (proxy a panico-backend) */
  @Patch('usuarios/bloquear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermiso('alertas')
  @ApiBearerAuth()
  async bloquearUsuario(
    @Body() body: { dni: string; motivo: string; operadorRef: string; tipo?: string },
  ) {
    return this.service.bloquearUsuarioPorDni(body.dni, body.motivo, body.operadorRef, body.tipo);
  }

  /** Desbloquea un usuario por ID (proxy a panico-backend) */
  @Patch('usuarios/:id/desbloquear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermiso('alertas')
  @ApiBearerAuth()
  async desbloquearUsuario(
    @Param('id') id: string,
    @Body() body: { operadorRef?: string },
  ) {
    return this.service.desbloquearUsuario(+id, body.operadorRef ?? 'cecom-operador');
  }

  /** Lista todos los vecinos registrados en la app (proxy a panico-backend) */
  @Get('usuarios')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermiso('alertas')
  @ApiBearerAuth()
  async listarUsuarios() {
    return this.service.listarUsuariosApp();
  }

  /** Historial de bloqueos de un vecino (proxy a panico-backend) */
  @Get('usuarios/:id/bloqueos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequierePermiso('alertas')
  @ApiBearerAuth()
  async historialBloqueos(@Param('id') id: string) {
    return this.service.historialBloqueosUsuario(+id);
  }
}
