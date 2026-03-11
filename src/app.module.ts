import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { IncidenciasModule } from './incidencias/incidencias.module';
import { SerenosModule } from './serenos/serenos.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { RutasModule } from './rutas/rutas.module';
import { EvidenciasModule } from './evidencias/evidencias.module';
import { ReportesModule } from './reportes/reportes.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuditoriaInterceptor } from './auditoria/auditoria.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    IncidenciasModule,
    SerenosModule,
    CatalogosModule,
    RutasModule,
    EvidenciasModule,
    ReportesModule,
    AuditoriaModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditoriaInterceptor,
    },
  ],
})
export class AppModule {}
