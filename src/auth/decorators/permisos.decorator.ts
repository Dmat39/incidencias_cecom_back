import { SetMetadata } from '@nestjs/common';
import type { Modulo } from '../constants/role-permissions';

export const PERMISOS_KEY = 'permisos';

/**
 * Autoriza por MÓDULO en vez de por nombre de rol.
 * Basta con que el usuario tenga uno de los módulos indicados.
 *
 * Se resuelve contra los permisos que el rol tiene en la BD, así que un rol
 * creado desde el panel funciona sin tocar código.
 *
 * Puesto en un método, reemplaza por completo lo que declare la clase
 * (sea @Roles o @RequierePermiso).
 */
export const RequierePermiso = (...modulos: Modulo[]) =>
  SetMetadata(PERMISOS_KEY, modulos);
