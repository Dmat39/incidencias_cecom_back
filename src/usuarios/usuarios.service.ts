import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const SELECT_USUARIO = {
  id: true,
  nombres: true,
  apellidos: true,
  email: true,
  username: true,
  habilitado: true,
  medioId: true,
  medio: { select: { id: true, descripcion: true } },
  roles: { include: { rol: { select: { id: true, nombre: true } } } },
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  private async resolveRoleIds(roleNames: string[]): Promise<number[]> {
    const roles = await this.prisma.rol.findMany({
      where: { nombre: { in: roleNames } },
      select: { id: true },
    });
    return roles.map((r) => r.id);
  }

  async findAll() {
    return this.prisma.usuario.findMany({ select: SELECT_USUARIO });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: SELECT_USUARIO,
    });
    if (!usuario) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return usuario;
  }

  async create(dto: CreateUsuarioDto) {
    const exists = await this.prisma.usuario.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username ?? '' }] },
    });
    if (exists) throw new ConflictException('Email o username ya registrado');

    const hashed = await bcrypt.hash(dto.password, 10);
    const { roles, password, ...rest } = dto;

    const roleIds = roles?.length ? await this.resolveRoleIds(roles) : [];

    return this.prisma.usuario.create({
      data: {
        ...rest,
        password: hashed,
        roles: roleIds.length
          ? { create: roleIds.map((rolId) => ({ rolId })) }
          : undefined,
      },
      select: SELECT_USUARIO,
    });
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);
    const { roles, password, ...rest } = dto;
    const data: any = { ...rest };
    if (password) data.password = await bcrypt.hash(password, 10);

    if (roles !== undefined) {
      const roleIds = roles.length ? await this.resolveRoleIds(roles) : [];
      await this.prisma.usuarioRol.deleteMany({ where: { usuarioId: id } });
      if (roleIds.length) {
        data.roles = { create: roleIds.map((rolId) => ({ rolId })) };
      }
    }

    return this.prisma.usuario.update({
      where: { id },
      data,
      select: SELECT_USUARIO,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.delete({ where: { id }, select: SELECT_USUARIO });
  }

  async getRoles(id: number) {
    await this.findOne(id);
    return this.prisma.usuarioRol.findMany({
      where: { usuarioId: id },
      include: { rol: true },
    });
  }

  async updateRoles(id: number, roleNames: string[]) {
    await this.findOne(id);
    const roleIds = await this.resolveRoleIds(roleNames);
    await this.prisma.usuarioRol.deleteMany({ where: { usuarioId: id } });
    await this.prisma.usuarioRol.createMany({
      data: roleIds.map((rolId) => ({ usuarioId: id, rolId })),
    });
    return this.getRoles(id);
  }
}
