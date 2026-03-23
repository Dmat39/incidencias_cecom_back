import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GestionateService } from './gestionate.service';

@ApiTags('Gestionate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gestionate')
export class GestionateController {
  constructor(private readonly gestionateService: GestionateService) {}

  @Get('personal/:dni')
  @Roles('admin', 'supervisor', 'operador', 'validador')
  @ApiOperation({ summary: 'Buscar personal en Gestionate por DNI' })
  buscarPorDni(@Param('dni') dni: string) {
    return this.gestionateService.buscarPorDni(dni);
  }
}
