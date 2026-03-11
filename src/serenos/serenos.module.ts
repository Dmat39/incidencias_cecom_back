import { Module } from '@nestjs/common';
import { SerenosController } from './serenos.controller';
import { SerenosService } from './serenos.service';
import { BuscarSerenoController } from './buscar-sereno.controller';

@Module({
  controllers: [SerenosController, BuscarSerenoController],
  providers: [SerenosService],
})
export class SerenosModule {}
