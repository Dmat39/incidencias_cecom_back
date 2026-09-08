import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { getModulosForRoles } from '../constants/role-permissions';

export interface JwtPayload {
  sub: number;
  username: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub, habilitado: true },
      include: {
        roles: {
          include: {
            rol: {
              include: {
                permisos: { include: { permiso: { select: { nombre: true } } } },
              },
            },
          },
        },
      },
    });
    if (!usuario) throw new UnauthorizedException();

    // Roles y módulos se leen de la BD en cada request, NO del token: así un
    // cambio de rol surte efecto de inmediato, sin esperar a que expire el JWT.
    const roles = usuario.roles.map((ur) => ur.rol.nombre);

    const modulosSet = new Set<string>();
    for (const ur of usuario.roles) {
      for (const rp of ur.rol.permisos) {
        if (rp.permiso.nombre) modulosSet.add(rp.permiso.nombre);
      }
    }
    const modulos =
      modulosSet.size > 0 ? Array.from(modulosSet) : getModulosForRoles(roles);

    return { id: usuario.id, username: usuario.username, roles, modulos };
  }
}
