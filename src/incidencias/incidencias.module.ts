import { Module } from '@nestjs/common';
import { IncidenciasController } from './incidencias.controller';
import { BuscarIncidenciasController } from './buscar-incidencias.controller';
import { IncidenciasService } from './incidencias.service';
import { IncidenciasGateway } from './incidencias.gateway';
import { EvidenciasModule } from '../evidencias/evidencias.module';

@Module({
  imports: [EvidenciasModule],
  controllers: [IncidenciasController, BuscarIncidenciasController],
  providers: [IncidenciasService, IncidenciasGateway],
  exports: [IncidenciasService],
})
export class IncidenciasModule {}
