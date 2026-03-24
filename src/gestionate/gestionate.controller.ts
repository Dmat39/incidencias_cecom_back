import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GestionateService } from './gestionate.service';

class GuardarLocalDto {
  @IsString() dni: string;
  @IsString() @Length(1) nombreCompleto: string;
}

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

  @Get('personal/local/buscar-nombre')
  @Roles('admin', 'supervisor', 'operador', 'validador')
  @ApiOperation({ summary: 'Buscar serenos en tabla local por nombre/apellido' })
  buscarPorNombre(@Query('q') q: string) {
    if (!q || q.trim().length < 2) return { data: [] };
    return this.gestionateService.buscarPorNombre(q.trim());
  }

  @Get('personal/local/:dni')
  @Roles('admin', 'supervisor', 'operador', 'validador')
  @ApiOperation({ summary: 'Buscar sereno en tabla local por DNI' })
  buscarLocal(@Param('dni') dni: string) {
    return this.gestionateService.buscarLocal(dni);
  }

  @Post('personal/local')
  @Roles('admin', 'supervisor', 'operador', 'validador')
  @ApiOperation({ summary: 'Guardar sereno en tabla local' })
  guardarLocal(@Body() dto: GuardarLocalDto) {
    return this.gestionateService.guardarLocal(dto.dni, dto.nombreCompleto);
  }
}
