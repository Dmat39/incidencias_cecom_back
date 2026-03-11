import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EvidenciasService } from './evidencias.service';

@ApiTags('Evidencias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evidencias')
export class EvidenciasController {
  constructor(private evidenciasService: EvidenciasService) {}

  @Post('upload/:incidenciaId')
  @ApiOperation({ summary: 'Subir evidencia' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  upload(
    @Param('incidenciaId', ParseIntPipe) incidenciaId: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') usuarioId: number,
  ) {
    return this.evidenciasService.create(incidenciaId, file, usuarioId);
  }

  @Get('incidencia/:incidenciaId')
  @ApiOperation({ summary: 'Listar evidencias de una incidencia' })
  findByIncidencia(@Param('incidenciaId', ParseIntPipe) incidenciaId: number) {
    return this.evidenciasService.findByIncidencia(incidenciaId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar evidencia' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.evidenciasService.remove(id);
  }
}
