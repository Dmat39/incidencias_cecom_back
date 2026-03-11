import { Module } from '@nestjs/common';
import { RutasController } from './rutas.controller';
import { RutasService } from './rutas.service';

@Module({
  controllers: [RutasController],
  providers: [RutasService],
})
export class RutasModule {}
