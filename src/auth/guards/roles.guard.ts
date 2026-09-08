import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISOS_KEY } from '../decorators/permisos.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const clase = context.getClass();

    const handlerRoles = this.reflector.get<string[]>(ROLES_KEY, handler);
    const handlerModulos = this.reflector.get<string[]>(PERMISOS_KEY, handler);

    // Lo que declara el método reemplaza por completo lo que declara la clase,
    // para que un endpoint pueda ser más restrictivo que su controlador.
    const declaraElMetodo =
      !!handlerRoles?.length || !!handlerModulos?.length;

    const requiredRoles = declaraElMetodo
      ? handlerRoles
      : this.reflector.get<string[]>(ROLES_KEY, clase);
    const requiredModulos = declaraElMetodo
      ? handlerModulos
      : this.reflector.get<string[]>(PERMISOS_KEY, clase);

    if (!requiredRoles?.length && !requiredModulos?.length) return true;

    const { user } = context.switchToHttp().getRequest();

    // Por módulo (roles configurables desde el panel)
    if (requiredModulos?.length && requiredModulos.some((m) => user?.modulos?.includes(m))) {
      return true;
    }
    // Por nombre de rol (endpoints reservados, p. ej. gestión de roles)
    if (requiredRoles?.length && requiredRoles.some((r) => user?.roles?.includes(r))) {
      return true;
    }
    return false;
  }
}
