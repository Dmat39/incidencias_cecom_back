import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  @RequierePermiso('usuarios')
  @ApiOperation({ summary: 'Listar usuarios' })
  findAll(
    @Query('search') search?: string,
    @Query('page')   page?: string,
    @Query('limit')  limit?: string,
  ) {
    return this.usuariosService.findAll({
      search,
      page:  page  ? Number(page)  : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  @RequierePermiso('usuarios')
  @ApiOperation({ summary: 'Crear usuario' })
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Patch(':id')
  @RequierePermiso('usuarios')
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, dto);
  }

  @Delete(':id')
  @RequierePermiso('usuarios')
  @ApiOperation({ summary: 'Eliminar usuario' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }

  @Get(':id/roles')
  @RequierePermiso('usuarios')
  @ApiOperation({ summary: 'Obtener roles del usuario' })
  getRoles(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.getRoles(id);
  }

  @Patch(':id/roles')
  @RequierePermiso('usuarios')
  @ApiOperation({ summary: 'Actualizar roles del usuario' })
  updateRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body('roles') roles: string[],
  ) {
    return this.usuariosService.updateRoles(id, roles);
  }

  @Patch(':id/jurisdicciones')
  @RequierePermiso('usuarios')
  @ApiOperation({ summary: 'Asignar jurisdicciones de alertas SJL al usuario' })
  asignarJurisdicciones(
    @Param('id', ParseIntPipe) id: number,
    @Body('jurisdiccionIds') jurisdiccionIds: number[],
  ) {
    return this.usuariosService.asignarJurisdicciones(id, jurisdiccionIds ?? []);
  }

}
