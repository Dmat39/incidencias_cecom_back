import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

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
    private readonly prisma: PrismaService,
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
      throw new BadRequestException('No encontrado en Gestionate');
    }

    if (!personal) {
      throw new BadRequestException('No encontrado en Gestionate');
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

  // Busca en la tabla local de serenos por DNI exacto
  async buscarLocal(dni: string): Promise<PersonalGestionate | null> {
    const sereno = await this.prisma.sereno.findUnique({
      where: { dni },
      include: { cargoSereno: true },
    });
    if (!sereno) return null;
    return {
      id:          sereno.id,
      dni:         sereno.dni ?? dni,
      nombres:     sereno.nombres ?? '',
      apellidos:   sereno.apellidoPaterno ?? '',
      cargo:       sereno.cargoSereno?.descripcion ?? '',
      subgerencia: '',
    };
  }

  // Busca serenos en tabla local por nombre/apellido (búsqueda parcial)
  async buscarPorNombre(query: string): Promise<PersonalGestionate[]> {
    const serenos = await this.prisma.sereno.findMany({
      where: {
        habilitado: true,
        OR: [
          { nombres: { contains: query, mode: 'insensitive' } },
          { apellidoPaterno: { contains: query, mode: 'insensitive' } },
          { apellidoMaterno: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { cargoSereno: true },
      orderBy: { apellidoPaterno: 'asc' },
      take: 10,
    });

    return serenos.map(s => ({
      id:          s.id,
      dni:         s.dni ?? '',
      nombres:     s.nombres ?? '',
      apellidos:   `${s.apellidoPaterno ?? ''} ${s.apellidoMaterno ?? ''}`.trim(),
      cargo:       s.cargoSereno?.descripcion ?? '',
      subgerencia: '',
    }));
  }

  // Guarda un sereno en la tabla local (upsert por DNI)
  async guardarLocal(dni: string, nombreCompleto: string): Promise<void> {
    await this.prisma.sereno.upsert({
      where:  { dni },
      update: { nombres: nombreCompleto, habilitado: true },
      create: { dni, nombres: nombreCompleto, habilitado: true },
    });
  }
}
