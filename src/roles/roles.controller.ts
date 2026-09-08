import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @RequierePermiso('usuarios')
  @ApiOperation({ summary: 'Listar todos los roles con sus módulos' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permisos')
  @RequierePermiso('usuarios')
  @ApiOperation({ summary: 'Listar todos los módulos disponibles' })
  findAllPermisos() {
    return this.rolesService.findAllPermisos();
  }

  @Get(':id')
  @RequierePermiso('usuarios')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo rol' })
  create(@Body() body: { nombre: string; descripcion?: string; permisoIds?: number[] }) {
    return this.rolesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar nombre/descripción del rol' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nombre?: string; descripcion?: string },
  ) {
    return this.rolesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar rol (solo si no tiene usuarios asignados)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }

  @Patch(':id/permisos')
  @ApiOperation({ summary: 'Asignar módulos al rol' })
  asignarPermisos(
    @Param('id', ParseIntPipe) id: number,
    @Body('permisoIds') permisoIds: number[],
  ) {
    return this.rolesService.asignarPermisos(id, permisoIds ?? []);
  }

  @Patch(':id/jurisdicciones')
  @ApiOperation({ summary: 'Asignar jurisdicciones de alertas SJL al rol (vacío = ve todas)' })
  asignarJurisdicciones(
    @Param('id', ParseIntPipe) id: number,
    @Body('jurisdiccionIds') jurisdiccionIds: number[],
  ) {
    return this.rolesService.asignarJurisdicciones(id, jurisdiccionIds ?? []);
  }
}
