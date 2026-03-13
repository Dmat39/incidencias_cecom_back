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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IncidenciasService } from './incidencias.service';
import { CreateIncidenciaDto } from './dto/create-incidencia.dto';
import {
  UpdateAtencionDto,
  UpdateEstadoDto,
  UpdateIncidenciaDto,
  UpdateSerenosDto,
} from './dto/update-incidencia.dto';
import { FilterIncidenciaDto } from './dto/filter-incidencia.dto';

@ApiTags('Incidencias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'supervisor', 'operador', 'validador')
@Controller('incidencias')
export class IncidenciasController {
  constructor(private incidenciasService: IncidenciasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar incidencias con filtros y paginación' })
  findAll(@Query() filters: FilterIncidenciaDto) {
    return this.incidenciasService.findAll(filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'KPIs y estadísticas del dashboard' })
  getDashboardStats(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin')    fechaFin?: string,
  ) {
    return this.incidenciasService.getDashboardStats(fechaInicio, fechaFin);
  }

  @Get('mapa')
  @ApiOperation({ summary: 'Datos para mapa (lat, lng, estado, tipo)' })
  findMapa(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin')    fechaFin?: string,
  ) {
    return this.incidenciasService.findMapa(fechaInicio, fechaFin);
  }

  @Get('calor')
  @ApiOperation({ summary: 'Datos para mapa de calor' })
  findCalor() {
    return this.incidenciasService.findCalor();
  }

  @Get('codigo/:codigo')
  @ApiOperation({ summary: 'Buscar por código de incidencia' })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.incidenciasService.findByCodigo(codigo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener incidencia por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.incidenciasService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear incidencia' })
  create(
    @Body() dto: CreateIncidenciaDto,
    @CurrentUser('id') usuarioId: number,
  ) {
    return this.incidenciasService.create(dto, usuarioId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar incidencia' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIncidenciaDto,
  ) {
    return this.incidenciasService.update(id, dto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de incidencia' })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoDto,
  ) {
    return this.incidenciasService.updateEstado(id, dto);
  }

  @Patch(':id/atencion')
  @ApiOperation({ summary: 'Registrar atención/despacho' })
  updateAtencion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAtencionDto,
  ) {
    return this.incidenciasService.updateAtencion(id, dto);
  }

  @Patch(':id/serenos')
  @ApiOperation({ summary: 'Asignar serenos a incidencia' })
  updateSerenos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSerenosDto,
  ) {
    return this.incidenciasService.updateSerenos(id, dto.serenosIds);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar incidencia' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.incidenciasService.remove(id);
  }

  @Post(':id/evidencias')
  @ApiOperation({ summary: 'Subir evidencia a incidencia' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR ?? './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadEvidencia(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') usuarioId: number,
  ) {
    return {
      incidenciaId: id,
      nombreArchivo: file.originalname,
      rutaArchivo: file.path,
      usuarioId,
    };
  }
}
