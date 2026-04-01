export const MODULOS = [
  'dashboard',
  'incidencias',
  'mapa',
  'serenos',
  'usuarios',
  'catalogos',
  'reportes',
  'metricas',
  'auditoria',
  'svi',
] as const;

export type Modulo = (typeof MODULOS)[number];

export const ROLE_PERMISSIONS: Record<string, Modulo[]> = {
  admin:      ['dashboard', 'incidencias', 'mapa', 'serenos', 'usuarios', 'catalogos', 'reportes', 'metricas', 'auditoria', 'svi'],
  validador:  ['dashboard', 'incidencias', 'svi'],
  supervisor: ['dashboard', 'incidencias', 'mapa', 'usuarios', 'catalogos', 'reportes', 'metricas'],
  operador:   ['dashboard', 'incidencias', 'mapa'],
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
