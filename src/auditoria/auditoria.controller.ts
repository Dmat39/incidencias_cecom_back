import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditoriaService } from './auditoria.service';

@ApiTags('Auditoría')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auditoria/usuarios')
export class AuditoriaController {
  constructor(private auditoriaService: AuditoriaService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar auditoría de usuarios' })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.auditoriaService.findAll(+page, +limit);
  }
}
