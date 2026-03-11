import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditoriaService, AccionAuditoria } from './auditoria.service';

const METHOD_ACTION: Record<string, AccionAuditoria> = {
  POST:   'CREAR',
  PATCH:  'EDITAR',
  PUT:    'EDITAR',
  DELETE: 'ELIMINAR',
};

// Mapa de segmento de URL → nombre legible del módulo
const ROUTE_MODULO: Record<string, string> = {
  incidencias:       'Incidencias',
  serenos:           'Serenos',
  usuarios:          'Usuarios',
  catalogos:         'Catálogos',
  rutas:             'Rutas',
  evidencias:        'Evidencias',
  reportes:          'Reportes',
};

function detectarModulo(url: string): string {
  // url: /api/v1/catalogos/unidades  →  segmentos: ['api','v1','catalogos','unidades']
  const segmentos = url.split('?')[0].split('/').filter(Boolean);
  // Buscar el primer segmento que coincida con un módulo conocido
  for (const seg of segmentos) {
    if (ROUTE_MODULO[seg]) {
      const subseg = segmentos[segmentos.indexOf(seg) + 1];
      // Si hay subruta (ej. unidades, tipo-casos) incluirla
      if (subseg && !/^\d+$/.test(subseg)) {
        return `${ROUTE_MODULO[seg]} - ${subseg}`;
      }
      return ROUTE_MODULO[seg];
    }
  }
  return 'Sistema';
}

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method?.toUpperCase();
    const accion = METHOD_ACTION[method];

    // Solo auditar mutaciones
    if (!accion) return next.handle();

    const user = request.user;
    // Si no hay usuario autenticado (ruta pública), no auditar
    if (!user) return next.handle();

    const modulo = detectarModulo(request.url ?? '');
    const realizadoPor = user.username ?? String(user.id);
    const realizadoPorId = user.id ? Number(user.id) : undefined;

    // Capturar el body para detalles
    const detalles: Record<string, any> = {};
    if (request.body && typeof request.body === 'object') {
      // No guardar contraseñas
      const { password, passwordHash, ...rest } = request.body;
      Object.assign(detalles, rest);
    }
    // Capturar ID del recurso si está en params
    if (request.params?.id) {
      detalles.id = request.params.id;
    }

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          // Intentar extraer nombre del recurso afectado de la respuesta
          let usuarioAfectado = '-';
          const data = responseData?.data ?? responseData;
          if (data) {
            usuarioAfectado =
              data.username ??
              data.nombre ??
              data.name ??
              data.descripcion ??
              data.placa ??
              (data.id ? `ID ${data.id}` : '-');
          }
          // Registrar de forma asíncrona (no bloquear la respuesta)
          this.auditoriaService
            .registrar({
              modulo,
              accion,
              usuarioAfectado: String(usuarioAfectado),
              realizadoPor,
              realizadoPorId,
              detalles,
            })
            .catch(() => {
              // Silenciar errores de auditoría para no romper la respuesta
            });
        },
      }),
    );
  }
}
