import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { getModulosForRoles } from './constants/role-permissions';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

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

  me(user: { id: number; username: string; roles: string[] }) {
    return {
      id: user.id,
      username: user.username,
      roles: user.roles,
      modulosPermitidos: getModulosForRoles(user.roles),
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

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, usuarioId, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
