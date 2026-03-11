import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RutasService } from './rutas.service';

@ApiTags('Rutas GPS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rutas')
export class RutasController {
  constructor(private rutasService: RutasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar rutas recientes' })
  findAll() {
    return this.rutasService.findAll();
  }

  @Get('unidad/:id')
  @ApiOperation({ summary: 'Rutas por unidad' })
  findByUnidad(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.findByUnidad(id);
  }

  @Get('coordenadas/unidad/:id')
  @ApiOperation({ summary: 'Coordenadas GPS por unidad' })
  findCoordenadasByUnidad(@Param('id', ParseIntPipe) id: number) {
    return this.rutasService.findCoordenadasByUnidad(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar posición GPS' })
  create(@Body() data: any) {
    return this.rutasService.create(data);
  }
}
