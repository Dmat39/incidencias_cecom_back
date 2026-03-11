export const MODULOS = [
  'dashboard',
  'incidencias',
  'mapa',
  'serenos',
  'usuarios',
  'catalogos',
  'reportes',
  'auditoria',
  'svi',
] as const;

export type Modulo = (typeof MODULOS)[number];

export const ROLE_PERMISSIONS: Record<string, Modulo[]> = {
  admin:      ['dashboard', 'incidencias', 'mapa', 'serenos', 'usuarios', 'catalogos', 'reportes', 'auditoria', 'svi'],
  validador:  ['dashboard', 'incidencias', 'reportes', 'svi'],
  supervisor: ['dashboard', 'incidencias', 'mapa', 'usuarios', 'catalogos'],
  operador:   ['dashboard', 'incidencias', 'mapa', 'reportes'],
};

export function getModulosForRoles(roles: string[]): Modulo[] {
  const set = new Set<Modulo>();
  for (const role of roles) {
    for (const modulo of ROLE_PERMISSIONS[role] ?? []) {
      set.add(modulo);
    }
  }
  return Array.from(set);
}
