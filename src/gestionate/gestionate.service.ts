import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface PersonalGestionate {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  subgerencia: string;
}

@Injectable()
export class GestionateService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async buscarPorDni(dni: string): Promise<PersonalGestionate> {
    const apiKey = this.config.get<string>('GESTIONATE_API_KEY');
    const route  = this.config.get<string>('GESTIONATE_ROUTE');

    if (!apiKey || !route) {
      throw new InternalServerErrorException('Variables de Gestionate no configuradas');
    }

    let personal: any;
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${route}/${dni}`, {
          headers: { 'x-api-key': apiKey },
        }),
      );
      personal = data?.data;
    } catch {
      throw new BadRequestException('No se encontró personal con ese DNI en Gestionate');
    }

    if (!personal) {
      throw new BadRequestException('No se encontró personal con ese DNI en Gestionate');
    }

    return {
      id:          personal.id,
      dni,
      nombres:     personal.nombres,
      apellidos:   personal.apellidos,
      cargo:       personal.cargo?.nombre ?? '',
      subgerencia: personal.subgerencia?.nombre ?? '',
    };
  }
}
