import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GestionateService } from './gestionate.service';
import { GestionateController } from './gestionate.controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get<string>('GESTIONATE_API_URL'),
        timeout: 8000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [GestionateService],
  controllers: [GestionateController],
  exports: [GestionateService],
})
export class GestionateModule {}
