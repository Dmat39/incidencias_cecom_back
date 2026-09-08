import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { getModulosForRoles } from './constants/role-permissions';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ username: dto.username }, { email: dto.username }],
        habilitado: true,
      },
      include: { roles: { include: { rol: true } } },
    });

    if (!usuario || !(await bcrypt.compare(dto.password, usuario.password))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const roles = usuario.roles.map((ur) => ur.rol.nombre);
    const tokens = await this.generateTokens(usuario.id, usuario.username!, roles);

    return {
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        username: usuario.username,
        roles,
      },
      ...tokens,
    };
  }

  async refresh(usuarioId: number, oldRefreshToken: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId, habilitado: true },
      include: { roles: { include: { rol: true } } },
    });
    if (!usuario) throw new ForbiddenException();

    // Revocar token anterior
    await this.prisma.refreshToken.updateMany({
      where: { token: oldRefreshToken },
      data: { revokedAt: new Date() },
    });

    const roles = usuario.roles.map((ur) => ur.rol.nombre);
    return this.generateTokens(usuario.id, usuario.username!, roles);
  }

  async me(user: {
    id: number;
    username: string;
    roles: string[];
    modulos?: string[];
  }) {
    const [directas, rolesConJurisdicciones] = await Promise.all([
      this.prisma.usuarioJurisdiccionAsignada.findMany({
        where: { usuarioId: user.id },
        select: { jurisdiccionId: true },
      }),
      this.prisma.rol.findMany({
        where: { nombre: { in: user.roles } },
        select: { jurisdicciones: { select: { jurisdiccionId: true } } },
      }),
    ]);

    // Los módulos los calcula ya JwtStrategy contra la BD. Se reutilizan tal
    // cual para que el menú del front y RolesGuard nunca puedan divergir.
    const modulosPermitidos = user.modulos ?? getModulosForRoles(user.roles);

    const deRoles = rolesConJurisdicciones.flatMap((r) =>
      r.jurisdicciones.map((rj) => rj.jurisdiccionId),
    );
    const jurisdiccionesEfectivas = [
      ...new Set([...directas.map((a) => a.jurisdiccionId), ...deRoles]),
    ];

    return {
      id: user.id,
      username: user.username,
      roles: user.roles,
      modulosPermitidos,
      jurisdiccionesAsignadas: jurisdiccionesEfectivas,
    };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
    return { message: 'Sesión cerrada' };
  }

  private async generateTokens(
    usuarioId: number,
    username: string,
    roles: string[],
  ) {
    const payload = { sub: usuarioId, username, roles };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(
        { sub: usuarioId },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
        },
      ),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.upsert({
      where: { token: refreshToken },
      create: { token: refreshToken, usuarioId, expiresAt },
      update: { usuarioId, expiresAt, revokedAt: null },
    });

    return { accessToken, refreshToken };
  }
}
