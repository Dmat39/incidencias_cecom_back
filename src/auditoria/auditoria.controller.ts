import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';
import { AuditoriaService } from './auditoria.service';

@ApiTags('Auditoría')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auditoria/usuarios')
export class AuditoriaController {
  constructor(private auditoriaService: AuditoriaService) {}

  @Get()
  @RequierePermiso('auditoria')
  @ApiOperation({ summary: 'Listar auditoría' })
  findAll(
    @Query('page')   page   = '1',
    @Query('limit')  limit  = '20',
    @Query('modulo') modulo?: string,
    @Query('search') search?: string,
    @Query('accion') accion?: string,
  ) {
    return this.auditoriaService.findAll(+page, +limit, modulo, search, accion);
  }
}
