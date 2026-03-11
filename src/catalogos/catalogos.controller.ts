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
import { Roles } from '../auth/decorators/roles.decorator';
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
  @Roles('admin', 'supervisor')
  createUnidad(@Body() data: any) { return this.catalogosService.createUnidad(data); }

  @Patch('unidades/:id')
  @Roles('admin', 'supervisor')
  updateUnidad(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateUnidad(id, data);
  }

  @Delete('unidades/:id')
  @Roles('admin', 'supervisor')
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
  @Roles('admin', 'supervisor')
  createTipoCaso(@Body() data: any) { return this.catalogosService.createTipoCaso(data); }

  @Patch('tipo-casos/:id')
  @Roles('admin', 'supervisor')
  updateTipoCaso(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateTipoCaso(id, data);
  }

  @Delete('tipo-casos/:id')
  @Roles('admin', 'supervisor')
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
  @Roles('admin', 'supervisor')
  createSubTipoCaso(@Body() data: any) { return this.catalogosService.createSubTipoCaso(data); }

  @Patch('subtipo-casos/:id')
  @Roles('admin', 'supervisor')
  updateSubTipoCaso(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateSubTipoCaso(id, data);
  }

  @Delete('subtipo-casos/:id')
  @Roles('admin', 'supervisor')
  removeSubTipoCaso(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeSubTipoCaso(id);
  }

  // ─── JURISDICCIONES ────────────────────────────────────────────────────────
  @Get('jurisdicciones')
  @ApiOperation({ summary: 'Listar jurisdicciones' })
  findJurisdicciones() { return this.catalogosService.findJurisdicciones(); }

  @Post('jurisdicciones')
  @Roles('admin', 'supervisor')
  createJurisdiccion(@Body() data: any) { return this.catalogosService.createJurisdiccion(data); }

  @Patch('jurisdicciones/:id')
  @Roles('admin', 'supervisor')
  updateJurisdiccion(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateJurisdiccion(id, data);
  }

  @Delete('jurisdicciones/:id')
  @Roles('admin', 'supervisor')
  removeJurisdiccion(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeJurisdiccion(id);
  }

  // ─── MEDIOS ────────────────────────────────────────────────────────────────
  @Get('medios')
  @ApiOperation({ summary: 'Listar medios de reporte' })
  findMedios() { return this.catalogosService.findMedios(); }

  @Post('medios')
  @Roles('admin', 'supervisor')
  createMedio(@Body() data: any) { return this.catalogosService.createMedio(data); }

  @Patch('medios/:id')
  @Roles('admin', 'supervisor')
  updateMedio(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateMedio(id, data);
  }

  @Delete('medios/:id')
  @Roles('admin', 'supervisor')
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
  @Roles('admin', 'supervisor')
  createOperador(@Body() data: any) { return this.catalogosService.createOperador(data); }

  @Patch('operadores/:id')
  @Roles('admin', 'supervisor')
  updateOperador(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateOperador(id, data);
  }

  @Delete('operadores/:id')
  @Roles('admin', 'supervisor')
  removeOperador(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeOperador(id);
  }

  // ─── ESTADO INCIDENCIAS ────────────────────────────────────────────────────
  @Get('estado-incidencias')
  @ApiOperation({ summary: 'Listar estados de incidencia' })
  findEstadoIncidencias() { return this.catalogosService.findEstadoIncidencias(); }

  @Post('estado-incidencias')
  @Roles('admin', 'supervisor')
  createEstadoIncidencia(@Body() data: any) { return this.catalogosService.createEstadoIncidencia(data); }

  @Patch('estado-incidencias/:id')
  @Roles('admin', 'supervisor')
  updateEstadoIncidencia(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateEstadoIncidencia(id, data);
  }

  @Delete('estado-incidencias/:id')
  @Roles('admin', 'supervisor')
  removeEstadoIncidencia(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeEstadoIncidencia(id);
  }

  // ─── SEVERIDADES ───────────────────────────────────────────────────────────
  @Get('severidades')
  @ApiOperation({ summary: 'Listar severidades' })
  findSeveridades() { return this.catalogosService.findSeveridades(); }

  @Post('severidades')
  @Roles('admin', 'supervisor')
  createSeveridad(@Body() data: any) { return this.catalogosService.createSeveridad(data); }

  @Patch('severidades/:id')
  @Roles('admin', 'supervisor')
  updateSeveridad(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateSeveridad(id, data);
  }

  @Delete('severidades/:id')
  @Roles('admin', 'supervisor')
  removeSeveridad(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeSeveridad(id);
  }

  // ─── CARGO SERENOS ─────────────────────────────────────────────────────────
  @Get('cargo-serenos')
  @ApiOperation({ summary: 'Listar cargos de sereno' })
  findCargoSerenos() { return this.catalogosService.findCargoSerenos(); }

  @Post('cargo-serenos')
  @Roles('admin', 'supervisor')
  createCargoSereno(@Body() data: any) { return this.catalogosService.createCargoSereno(data); }

  @Patch('cargo-serenos/:id')
  @Roles('admin', 'supervisor')
  updateCargoSereno(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateCargoSereno(id, data);
  }

  @Delete('cargo-serenos/:id')
  @Roles('admin', 'supervisor')
  removeCargoSereno(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeCargoSereno(id);
  }

  // ─── TIPO REPORTANTES ──────────────────────────────────────────────────────
  @Get('tipo-reportantes')
  @ApiOperation({ summary: 'Listar tipos de reportante' })
  findTipoReportantes() { return this.catalogosService.findTipoReportantes(); }

  @Post('tipo-reportantes')
  @Roles('admin', 'supervisor')
  createTipoReportante(@Body() data: any) { return this.catalogosService.createTipoReportante(data); }

  @Patch('tipo-reportantes/:id')
  @Roles('admin', 'supervisor')
  updateTipoReportante(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateTipoReportante(id, data);
  }

  @Delete('tipo-reportantes/:id')
  @Roles('admin', 'supervisor')
  removeTipoReportante(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeTipoReportante(id);
  }

  // ─── ESTADO PROCESOS ───────────────────────────────────────────────────────
  @Get('estado-procesos')
  @ApiOperation({ summary: 'Listar estados de proceso' })
  findEstadoProcesos() { return this.catalogosService.findEstadoProcesos(); }

  @Post('estado-procesos')
  @Roles('admin', 'supervisor')
  createEstadoProceso(@Body() data: any) { return this.catalogosService.createEstadoProceso(data); }

  @Patch('estado-procesos/:id')
  @Roles('admin', 'supervisor')
  updateEstadoProceso(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateEstadoProceso(id, data);
  }

  @Delete('estado-procesos/:id')
  @Roles('admin', 'supervisor')
  removeEstadoProceso(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeEstadoProceso(id);
  }

  // ─── GENERO AGRESOR ────────────────────────────────────────────────────────
  @Get('genero-agresor')
  @ApiOperation({ summary: 'Listar géneros de agresor' })
  findGeneroAgresor() { return this.catalogosService.findGeneroAgresor(); }

  @Post('genero-agresor')
  @Roles('admin', 'supervisor')
  createGeneroAgresor(@Body() data: any) { return this.catalogosService.createGeneroAgresor(data); }

  @Patch('genero-agresor/:id')
  @Roles('admin', 'supervisor')
  updateGeneroAgresor(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateGeneroAgresor(id, data);
  }

  @Delete('genero-agresor/:id')
  @Roles('admin', 'supervisor')
  removeGeneroAgresor(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeGeneroAgresor(id);
  }

  // ─── GENERO VICTIMA ────────────────────────────────────────────────────────
  @Get('genero-victima')
  @ApiOperation({ summary: 'Listar géneros de víctima' })
  findGeneroVictima() { return this.catalogosService.findGeneroVictima(); }

  @Post('genero-victima')
  @Roles('admin', 'supervisor')
  createGeneroVictima(@Body() data: any) { return this.catalogosService.createGeneroVictima(data); }

  @Patch('genero-victima/:id')
  @Roles('admin', 'supervisor')
  updateGeneroVictima(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateGeneroVictima(id, data);
  }

  @Delete('genero-victima/:id')
  @Roles('admin', 'supervisor')
  removeGeneroVictima(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeGeneroVictima(id);
  }

  // ─── SEVERIDAD PROCESOS ────────────────────────────────────────────────────
  @Get('severidad-procesos')
  @ApiOperation({ summary: 'Listar severidades de proceso' })
  findSeveridadProcesos() { return this.catalogosService.findSeveridadProcesos(); }

  @Post('severidad-procesos')
  @Roles('admin', 'supervisor')
  createSeveridadProceso(@Body() data: any) { return this.catalogosService.createSeveridadProceso(data); }

  @Patch('severidad-procesos/:id')
  @Roles('admin', 'supervisor')
  updateSeveridadProceso(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.catalogosService.updateSeveridadProceso(id, data);
  }

  @Delete('severidad-procesos/:id')
  @Roles('admin', 'supervisor')
  removeSeveridadProceso(@Param('id', ParseIntPipe) id: number) {
    return this.catalogosService.removeSeveridadProceso(id);
  }
}
