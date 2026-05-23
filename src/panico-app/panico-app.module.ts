import { Module } from '@nestjs/common';
import { PanicoAppController } from './panico-app.controller';
import { PanicoAppService } from './panico-app.service';
import { IncidenciasModule } from '../incidencias/incidencias.module';

@Module({
  imports: [IncidenciasModule],
  controllers: [PanicoAppController],
  providers: [PanicoAppService],
})
export class PanicoAppModule {}
