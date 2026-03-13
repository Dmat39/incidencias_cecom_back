import { Module } from '@nestjs/common';
import { EvidenciasController } from './evidencias.controller';
import { EvidenciasService } from './evidencias.service';

@Module({
  controllers: [EvidenciasController],
  providers: [EvidenciasService],
  exports: [EvidenciasService],
})
export class EvidenciasModule {}
