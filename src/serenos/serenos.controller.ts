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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SerenosService } from './serenos.service';
import { CreateSerenoDto } from './dto/create-sereno.dto';

@ApiTags('Serenos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('serenos')
export class SerenosController {
  constructor(private serenosService: SerenosService) {}

  // ─── Lectura: todos los roles autenticados ────────────────────────────────

  @Get()
  @Roles('admin', 'supervisor', 'operador', 'validador')
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
  @Roles('admin', 'supervisor', 'operador', 'validador')
  @ApiOperation({ summary: 'Listar serenos por cargo' })
  findByCargo(@Param('cargoId', ParseIntPipe) cargoId: number) {
    return this.serenosService.findByCargo(cargoId);
  }

  @Get(':id')
  @Roles('admin', 'supervisor', 'operador', 'validador')
  @ApiOperation({ summary: 'Obtener sereno por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serenosService.findOne(id);
  }

  // ─── Escritura: solo admin ────────────────────────────────────────────────

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear sereno' })
  create(@Body() dto: CreateSerenoDto) {
    return this.serenosService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar sereno' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateSerenoDto>,
  ) {
    return this.serenosService.update(id, dto);
  }

  @Patch(':id/estado')
  @Roles('admin')
  @ApiOperation({ summary: 'Habilitar/deshabilitar sereno' })
  toggleEstado(@Param('id', ParseIntPipe) id: number) {
    return this.serenosService.toggleEstado(id);
  }
}
