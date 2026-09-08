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
import { CatalogosService } from './catalogos.service';

@ApiTags('Catálogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('catalogos')
export class CatalogosController {
  constructor(private catalogosService: CatalogosService) {}

  // ─── UNIDADES ──────────────────────────────────────────────────────────────
  @Get('unidades')
  @ApiOperation({ summary: 'Listar unidades' })
  findUnidades(@Query('todos') todos?: string) {
    return this.catalogosService.findUnidades(todos !== 'true');
  }

  @Post('unidades')
  @RequierePermiso('catalogos')
  createUnidad(@Body() data: any) { return this.catalogosService.createUnidad(data); }

  @Patch('unidades/:id')
  @RequierePermiso('catalogos')
  updateUnidad(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateUnidad(id, data);
  }

  @Delete('unidades/:id')
  @RequierePermiso('catalogos')
  removeUnidad(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeUnidad(id);
  }

  // ─── TIPO CASOS ────────────────────────────────────────────────────────────
  @Get('tipo-casos')
  @ApiOperation({ summary: 'Listar tipos de caso' })
  findTipoCasos(@Query('unidadId') unidadId?: string) {
    return this.catalogosService.findTipoCasos(unidadId ? +unidadId : undefined);
  }

  @Post('tipo-casos')
  @RequierePermiso('catalogos')
  createTipoCaso(@Body() data: any) { return this.catalogosService.createTipoCaso(data); }

  @Patch('tipo-casos/:id')
  @RequierePermiso('catalogos')
  updateTipoCaso(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateTipoCaso(id, data);
  }

  @Delete('tipo-casos/:id')
  @RequierePermiso('catalogos')
  removeTipoCaso(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeTipoCaso(id);
  }

  // ─── SUBTIPO CASOS ─────────────────────────────────────────────────────────
  @Get('subtipo-casos')
  @ApiOperation({ summary: 'Listar subtipos de caso' })
  findSubTipoCasos(@Query('tipoCasoId') tipoCasoId?: string) {
    return this.catalogosService.findSubTipoCasos(tipoCasoId ? +tipoCasoId : undefined);
  }

  @Post('subtipo-casos')
  @RequierePermiso('catalogos')
  createSubTipoCaso(@Body() data: any) { return this.catalogosService.createSubTipoCaso(data); }

  @Patch('subtipo-casos/:id')
  @RequierePermiso('catalogos')
  updateSubTipoCaso(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateSubTipoCaso(id, data);
  }

  @Delete('subtipo-casos/:id')
  @RequierePermiso('catalogos')
  removeSubTipoCaso(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeSubTipoCaso(id);
  }

  // ─── JURISDICCIONES ────────────────────────────────────────────────────────
  @Get('jurisdicciones')
  @ApiOperation({ summary: 'Listar jurisdicciones' })
  findJurisdicciones() { return this.catalogosService.findJurisdicciones(); }

  @Post('jurisdicciones')
  @RequierePermiso('catalogos')
  createJurisdiccion(@Body() data: any) { return this.catalogosService.createJurisdiccion(data); }

  @Patch('jurisdicciones/:id')
  @RequierePermiso('catalogos')
  updateJurisdiccion(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateJurisdiccion(id, data);
  }

  @Delete('jurisdicciones/:id')
  @RequierePermiso('catalogos')
  removeJurisdiccion(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeJurisdiccion(id);
  }

  // ─── MEDIOS ────────────────────────────────────────────────────────────────
  @Get('medios')
  @ApiOperation({ summary: 'Listar medios de reporte' })
  findMedios() { return this.catalogosService.findMedios(); }

  @Post('medios')
  @RequierePermiso('catalogos')
  createMedio(@Body() data: any) { return this.catalogosService.createMedio(data); }

  @Patch('medios/:id')
  @RequierePermiso('catalogos')
  updateMedio(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateMedio(id, data);
  }

  @Delete('medios/:id')
  @RequierePermiso('catalogos')
  removeMedio(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeMedio(id);
  }

  // ─── OPERADORES ────────────────────────────────────────────────────────────
  @Get('operadores')
  @ApiOperation({ summary: 'Listar operadores' })
  findOperadores(@Query('medioId') medioId?: string) {
    return this.catalogosService.findOperadores(medioId ? +medioId : undefined);
  }

  @Post('operadores')
  @RequierePermiso('catalogos')
  createOperador(@Body() data: any) { return this.catalogosService.createOperador(data); }

  @Patch('operadores/:id')
  @RequierePermiso('catalogos')
  updateOperador(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateOperador(id, data);
  }

  @Delete('operadores/:id')
  @RequierePermiso('catalogos')
  removeOperador(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeOperador(id);
  }

  // ─── ESTADO INCIDENCIAS ────────────────────────────────────────────────────
  @Get('estado-incidencias')
  @ApiOperation({ summary: 'Listar estados de incidencia' })
  findEstadoIncidencias() { return this.catalogosService.findEstadoIncidencias(); }

  @Post('estado-incidencias')
  @RequierePermiso('catalogos')
  createEstadoIncidencia(@Body() data: any) { return this.catalogosService.createEstadoIncidencia(data); }

  @Patch('estado-incidencias/:id')
  @RequierePermiso('catalogos')
  updateEstadoIncidencia(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateEstadoIncidencia(id, data);
  }

  @Delete('estado-incidencias/:id')
  @RequierePermiso('catalogos')
  removeEstadoIncidencia(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeEstadoIncidencia(id);
  }

  // ─── SEVERIDADES ───────────────────────────────────────────────────────────
  @Get('severidades')
  @ApiOperation({ summary: 'Listar severidades' })
  findSeveridades() { return this.catalogosService.findSeveridades(); }

  @Post('severidades')
  @RequierePermiso('catalogos')
  createSeveridad(@Body() data: any) { return this.catalogosService.createSeveridad(data); }

  @Patch('severidades/:id')
  @RequierePermiso('catalogos')
  updateSeveridad(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateSeveridad(id, data);
  }

  @Delete('severidades/:id')
  @RequierePermiso('catalogos')
  removeSeveridad(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeSeveridad(id);
  }

  // ─── CARGO SERENOS ─────────────────────────────────────────────────────────
  @Get('cargo-serenos')
  @ApiOperation({ summary: 'Listar cargos de sereno' })
  findCargoSerenos() { return this.catalogosService.findCargoSerenos(); }

  @Post('cargo-serenos')
  @RequierePermiso('catalogos')
  createCargoSereno(@Body() data: any) { return this.catalogosService.createCargoSereno(data); }

  @Patch('cargo-serenos/:id')
  @RequierePermiso('catalogos')
  updateCargoSereno(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateCargoSereno(id, data);
  }

  @Delete('cargo-serenos/:id')
  @RequierePermiso('catalogos')
  removeCargoSereno(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeCargoSereno(id);
  }

  // ─── TIPO REPORTANTES ──────────────────────────────────────────────────────
  @Get('tipo-reportantes')
  @ApiOperation({ summary: 'Listar tipos de reportante' })
  findTipoReportantes() { return this.catalogosService.findTipoReportantes(); }

  @Post('tipo-reportantes')
  @RequierePermiso('catalogos')
  createTipoReportante(@Body() data: any) { return this.catalogosService.createTipoReportante(data); }

  @Patch('tipo-reportantes/:id')
  @RequierePermiso('catalogos')
  updateTipoReportante(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateTipoReportante(id, data);
  }

  @Delete('tipo-reportantes/:id')
  @RequierePermiso('catalogos')
  removeTipoReportante(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeTipoReportante(id);
  }

  // ─── ESTADO PROCESOS ───────────────────────────────────────────────────────
  @Get('estado-procesos')
  @ApiOperation({ summary: 'Listar estados de proceso' })
  findEstadoProcesos() { return this.catalogosService.findEstadoProcesos(); }

  @Post('estado-procesos')
  @RequierePermiso('catalogos')
  createEstadoProceso(@Body() data: any) { return this.catalogosService.createEstadoProceso(data); }

  @Patch('estado-procesos/:id')
  @RequierePermiso('catalogos')
  updateEstadoProceso(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateEstadoProceso(id, data);
  }

  @Delete('estado-procesos/:id')
  @RequierePermiso('catalogos')
  removeEstadoProceso(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeEstadoProceso(id);
  }

  // ─── GENERO AGRESOR ────────────────────────────────────────────────────────
  @Get('genero-agresor')
  @ApiOperation({ summary: 'Listar géneros de agresor' })
  findGeneroAgresor() { return this.catalogosService.findGeneroAgresor(); }

  @Post('genero-agresor')
  @RequierePermiso('catalogos')
  createGeneroAgresor(@Body() data: any) { return this.catalogosService.createGeneroAgresor(data); }

  @Patch('genero-agresor/:id')
  @RequierePermiso('catalogos')
  updateGeneroAgresor(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateGeneroAgresor(id, data);
  }

  @Delete('genero-agresor/:id')
  @RequierePermiso('catalogos')
  removeGeneroAgresor(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeGeneroAgresor(id);
  }

  // ─── GENERO VICTIMA ────────────────────────────────────────────────────────
  @Get('genero-victima')
  @ApiOperation({ summary: 'Listar géneros de víctima' })
  findGeneroVictima() { return this.catalogosService.findGeneroVictima(); }

  @Post('genero-victima')
  @RequierePermiso('catalogos')
  createGeneroVictima(@Body() data: any) { return this.catalogosService.createGeneroVictima(data); }

  @Patch('genero-victima/:id')
  @RequierePermiso('catalogos')
  updateGeneroVictima(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateGeneroVictima(id, data);
  }

  @Delete('genero-victima/:id')
  @RequierePermiso('catalogos')
  removeGeneroVictima(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeGeneroVictima(id);
  }

  // ─── SEVERIDAD PROCESOS ────────────────────────────────────────────────────
  @Get('severidad-procesos')
  @ApiOperation({ summary: 'Listar severidades de proceso' })
  findSeveridadProcesos() { return this.catalogosService.findSeveridadProcesos(); }

  @Post('severidad-procesos')
  @RequierePermiso('catalogos')
  createSeveridadProceso(@Body() data: any) { return this.catalogosService.createSeveridadProceso(data); }

  @Patch('severidad-procesos/:id')
  @RequierePermiso('catalogos')
  updateSeveridadProceso(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateSeveridadProceso(id, data);
  }

  @Delete('severidad-procesos/:id')
  @RequierePermiso('catalogos')
  removeSeveridadProceso(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeSeveridadProceso(id);
  }
}
