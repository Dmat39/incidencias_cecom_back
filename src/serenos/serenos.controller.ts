import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequierePermiso } from '../auth/decorators/permisos.decorator';
import { SerenosService } from './serenos.service';
import { CreateSerenoDto } from './dto/create-sereno.dto';

class SyncSerenoDto {
  @IsString() dni: string;
  @IsString() nombres: string;
  @IsString() apellidoPaterno: string;
  @IsOptional() @IsString() apellidoMaterno?: string;
}

@ApiTags('Serenos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('serenos')
export class SerenosController {
  constructor(private serenosService: SerenosService) {}

  // ─── Lectura: todos los roles autenticados ────────────────────────────────

  @Get()
  @RequierePermiso('serenos', 'incidencias')
  @ApiOperation({ summary: 'Listar serenos con paginación' })
  findAll(
    @Query('habilitado') habilitado?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const h = habilitado !== undefined ? habilitado === 'true' : undefined;
    return this.serenosService.findAll(h, search, +page, +limit);
  }

  @Get('por-cargo/:cargoId')
  @RequierePermiso('serenos', 'incidencias')
  @ApiOperation({ summary: 'Listar serenos por cargo' })
  findByCargo(@Param('cargoId', ParseIntPipe) cargoId: number) {
    return this.serenosService.findByCargo(cargoId);
  }

  @Get(':id')
  @RequierePermiso('serenos', 'incidencias')
  @ApiOperation({ summary: 'Obtener sereno por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serenosService.findOne(id);
  }

  // ─── Escritura: solo admin ────────────────────────────────────────────────

  @Post()
  @RequierePermiso('serenos')
  @ApiOperation({ summary: 'Crear sereno' })
  create(@Body() dto: CreateSerenoDto) {
    return this.serenosService.create(dto);
  }

  @Patch(':id')
  @RequierePermiso('serenos')
  @ApiOperation({ summary: 'Actualizar sereno' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateSerenoDto>,
  ) {
    return this.serenosService.update(id, dto);
  }

  @Patch(':id/estado')
  @RequierePermiso('serenos')
  @ApiOperation({ summary: 'Habilitar/deshabilitar sereno' })
  toggleEstado(@Param('id', ParseIntPipe) id: number) {
    return this.serenosService.toggleEstado(id);
  }

  // ─── Sync interno desde Gestionate (sin JWT) ─────────────────────────────
  @Post('sync')
  @ApiOperation({ summary: 'Sincronizar sereno desde Gestionate (uso interno)' })
  syncFromGestionate(@Body() dto: SyncSerenoDto) {
    return this.serenosService.syncFromGestionate(
      dto.dni,
      dto.nombres,
      dto.apellidoPaterno,
      dto.apellidoMaterno,
    );
  }
}
