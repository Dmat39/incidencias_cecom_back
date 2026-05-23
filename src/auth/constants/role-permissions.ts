export const MODULOS = [
  'dashboard',
  'incidencias',
  'alertas',
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
  admin:      ['dashboard', 'incidencias', 'alertas', 'mapa', 'serenos', 'usuarios', 'catalogos', 'reportes', 'metricas', 'auditoria', 'svi'],
  supervisor: ['dashboard', 'incidencias', 'alertas', 'mapa', 'usuarios', 'catalogos', 'reportes', 'metricas'],
  operador:   ['dashboard', 'incidencias', 'alertas', 'mapa'],
  validador:  ['dashboard', 'incidencias', 'svi'],
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
