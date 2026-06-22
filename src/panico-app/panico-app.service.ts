import { Injectable, Logger, OnModuleInit, InternalServerErrorException, HttpException, ConflictException, NotFoundException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { point, booleanPointInPolygon, polygon, multiPolygon } from '@turf/turf';
import { PrismaService } from '../prisma/prisma.service';
import { IncidenciasGateway } from '../incidencias/incidencias.gateway';

@Injectable()
export class PanicoAppService implements OnModuleInit {
  private readonly logger = new Logger(PanicoAppService.name);

  private readonly UNIDAD_ID           = Number(process.env.PANICO_UNIDAD_ID            ?? 1);
  private readonly TIPO_CASO_ID        = Number(process.env.PANICO_TIPO_CASO_ID         ?? 19);
  private readonly SUBTIPO_CASO_ID     = Number(process.env.PANICO_SUBTIPO_CASO_ID      ?? 92);
  private readonly TIPO_REPORTANTE_ID  = Number(process.env.PANICO_TIPO_REPORTANTE_ID   ?? 1);
  private readonly SEVERIDAD_ID        = Number(process.env.PANICO_SEVERIDAD_ID         ?? 4);
  private readonly MEDIO_ID            = Number(process.env.PANICO_MEDIO_ID             ?? 3);
  private readonly OPERADOR_ID         = Number(process.env.PANICO_OPERADOR_ID          ?? 25);
  private readonly JURISDICCION_DEFAULT = Number(process.env.PANICO_JURISDICCION_DEFAULT_ID ?? 8);

  private geojsonFeatures: any[] = [];
  private jurisdiccionesDb: { id: number; nombre: string | null }[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: IncidenciasGateway,
  ) {}

  async onModuleInit() {
    // Cargar GeoJSON de jurisdicciones (una sola vez al arrancar)
    try {
      const geojsonPath = join(process.cwd(), 'data', 'juridiccion.geojson');
      const raw = JSON.parse(readFileSync(geojsonPath, 'utf-8'));
      this.geojsonFeatures = raw?.features ?? [];
      this.logger.log(`GeoJSON cargado: ${this.geojsonFeatures.length} jurisdicciones`);
    } catch (e) {
      this.logger.warn(`No se pudo cargar juridiccion.geojson: ${e.message}`);
    }

    // Cargar lista de jurisdicciones de la DB
    try {
      this.jurisdiccionesDb = await this.prisma.jurisdiccion.findMany({
        select: { id: true, nombre: true },
        where: { habilitado: true },
      });
    } catch (e) {
      this.logger.warn(`No se pudo cargar jurisdicciones de DB: ${e.message}`);
    }
  }

  /** Detecta qué jurisdiccion contiene el punto (lat, lng) usando el GeoJSON. */
  private detectarJurisdiccionId(lat: number, lng: number): number {
    if (!this.geojsonFeatures.length || !this.jurisdiccionesDb.length) {
      return this.JURISDICCION_DEFAULT;
    }

    const pt = point([lng, lat]); // GeoJSON es [lng, lat]

    for (const feat of this.geojsonFeatures) {
      const geom = feat?.geometry;
      if (!geom?.coordinates) continue;

      try {
        const dentro =
          geom.type === 'MultiPolygon'
            ? booleanPointInPolygon(pt, multiPolygon(geom.coordinates))
            : booleanPointInPolygon(pt, polygon(geom.coordinates));

        if (dentro) {
          const nombreGeo = (feat.properties?.name ?? '').toLowerCase().trim();
          // Buscar en DB por coincidencia de nombre (contiene o es igual)
          const match = this.jurisdiccionesDb.find((j) => {
            const nombreDb = (j.nombre ?? '').toLowerCase().trim();
            return nombreDb === nombreGeo || nombreDb.includes(nombreGeo) || nombreGeo.includes(nombreDb);
          });
          if (match) {
            this.logger.log(`Jurisdicción detectada: ${match.nombre} (id: ${match.id})`);
            return match.id;
          }
        }
      } catch {
        // Polígono inválido, continuar
      }
    }

    this.logger.log(`Coordenadas fuera de todas las jurisdicciones → default (${this.JURISDICCION_DEFAULT})`);
    return this.JURISDICCION_DEFAULT;
  }

  /** Recibe el webhook de panico-backend y emite el evento de nueva alerta al frontend */
  procesarWebhookNuevaAlerta(alertaId: number) {
    this.gateway.emitNuevaAlertaPanico(alertaId);
    this.logger.log(`Webhook recibido: nueva alerta pánico #${alertaId} → emitido a clientes`);
  }

  /** Crea una incidencia CECOM manualmente a partir de una alerta del botón de pánico */
  async crearIncidenciaManual(
    panicAlertId: number,
    tipoCasoId: number,
    subTipoCasoId?: number,
    operadorId?: number,
  ) {
    // Verificar que no exista ya una incidencia para esta alerta
    const yaExiste = await this.prisma.incidencia.findFirst({
      where: { descripcion: { contains: `ID Alerta App: #${panicAlertId}` } },
      select: { id: true, codigoIncidencia: true },
    });
    if (yaExiste) {
      throw new ConflictException(
        `Ya existe una incidencia CECOM para la alerta #${panicAlertId} (${yaExiste.codigoIncidencia})`,
      );
    }

    // Obtener datos de la alerta desde panico-backend
    const { url, headers } = this.getPanicoBackendConfig();
    let alerta: any;
    try {
      const { data } = await axios.get(`${url}/api/alerts/${panicAlertId}`, { headers, timeout: 8000 });
      alerta = data;
    } catch (err) {
      this.rethrowAxiosError(err);
    }

    if (!alerta) throw new NotFoundException(`Alerta #${panicAlertId} no encontrada en panico-backend`);

    const jurisdiccionId = this.detectarJurisdiccionId(alerta.lat, alerta.lng);

    const incidencia = await this.prisma.incidencia.create({
      data: {
        unidadId:          this.UNIDAD_ID,
        tipoCasoId,
        ...(subTipoCasoId ? { subTipoCasoId } : {}),
        tipoReportanteId:  this.TIPO_REPORTANTE_ID,
        nombreReportante:  `${alerta.user.nombres} ${alerta.user.apellidos}`,
        telefonoReportante: alerta.user.telefono,
        direccion:         alerta.direccionAprox ?? `GPS: ${alerta.lat}, ${alerta.lng}`,
        latitud:           alerta.lat,
        longitud:          alerta.lng,
        descripcion:       `🚨 BOTÓN DE PÁNICO — App Vecino Seguro SJL\nVecino: ${alerta.user.nombres} ${alerta.user.apellidos}\nDNI: ${alerta.user.dni}\nTeléfono: ${alerta.user.telefono}\nID Alerta App: #${panicAlertId}\nEstado App: ${alerta.estado}`,
        severidadId:       this.SEVERIDAD_ID,
        jurisdiccionId,
        medioId:           this.MEDIO_ID,
        operadorId:        operadorId ?? this.OPERADOR_ID,
        registradoEn:      new Date(alerta.createdAt),
        ocurridoEn:        new Date(alerta.createdAt),
      },
      include: {
        unidad: true, tipoCaso: true, subTipoCaso: true,
        tipoReportante: true, severidad: true, jurisdiccion: true,
        situacion: true, medio: true, operador: true,
      },
    });

    this.logger.warn(
      `🚨 Incidencia CECOM #${incidencia.id} creada manualmente para alerta pánico #${panicAlertId}`,
    );

    this.gateway.emitNuevaIncidencia(incidencia);

    return { incidenciaId: incidencia.id, codigoIncidencia: incidencia.codigoIncidencia };
  }

  /** Lista alertas del botón de pánico, directamente desde panico-backend */
  async listarAlertas(page = 1, limit = 20, fecha?: string, estado?: string, usuarioId?: number) {
    const { url, headers } = this.getPanicoBackendConfig();

    // Jurisdicciones efectivas = propias del usuario ∪ jurisdicciones de sus roles
    let jurisdiccionIdsFilter: number[] | undefined;
    if (usuarioId) {
      const [directas, usuarioConRoles] = await Promise.all([
        this.prisma.usuarioJurisdiccionAsignada.findMany({
          where: { usuarioId },
          select: { jurisdiccionId: true },
        }),
        this.prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: {
            roles: {
              select: {
                rol: {
                  select: {
                    jurisdicciones: { select: { jurisdiccionId: true } },
                  },
                },
              },
            },
          },
        }),
      ]);

      const deRoles = (usuarioConRoles?.roles ?? []).flatMap((ur) =>
        ur.rol.jurisdicciones.map((rj) => rj.jurisdiccionId),
      );

      const efectivas = [
        ...new Set([...directas.map((a) => a.jurisdiccionId), ...deRoles]),
      ];

      if (efectivas.length > 0) {
        jurisdiccionIdsFilter = efectivas;
      }
    }

    // Si hay filtro de jurisdicción, traer más registros y re-paginar aquí
    const fetchLimit = jurisdiccionIdsFilter ? 1000 : limit;
    const fetchPage  = jurisdiccionIdsFilter ? 1    : page;

    // Mapear estados del dashboard → estados de panico-backend
    const estadoMap: Record<string, string> = {
      PENDIENTE:  'RECIBIDA',
      ATENDIENDO: 'ATENDIENDO',
      ATENDIDA:   'FINALIZADA',
      FALSA:      'FALSA',
    };
    const estadoPanico = estado && estadoMap[estado] ? estadoMap[estado] : undefined;

    const params: Record<string, string | number> = { page: fetchPage, limit: fetchLimit };
    if (fecha)        params.fecha  = fecha;
    if (estadoPanico) params.estado = estadoPanico;

    let panicoResp: any;
    try {
      const { data } = await axios.get(`${url}/api/alerts`, { headers, params, timeout: 8000 });
      panicoResp = data;
    } catch (err) {
      this.rethrowAxiosError(err);
    }

    const alertas: any[] = panicoResp?.data ?? [];
    const alertaIds: number[] = alertas.map((a: any) => a.id);

    // Buscar en CECOM si ya existe incidencia vinculada para cada alerta
    const incidenciasCecom = alertaIds.length
      ? await this.prisma.incidencia.findMany({
          where: {
            medioId: this.MEDIO_ID,
            OR: alertaIds.map((id) => ({ descripcion: { contains: `ID Alerta App: #${id}` } })),
          },
          select: { id: true, codigoIncidencia: true, descripcion: true },
        })
      : [];

    const incidenciaMap = new Map<number, { id: number; codigoIncidencia: string }>();
    for (const inc of incidenciasCecom) {
      const m = (inc.descripcion ?? '').match(/ID Alerta App: #(\d+)/);
      if (m) incidenciaMap.set(Number(m[1]), { id: inc.id, codigoIncidencia: inc.codigoIncidencia ?? '' });
    }

    // Mapear al formato esperado por el frontend
    let data = alertas.map((a: any) => ({
      id:                a.id,
      nombreReportante:  `${a.user?.nombres ?? ''} ${a.user?.apellidos ?? ''}`.trim() || null,
      telefonoReportante: a.user?.telefono ?? null,
      dniReportante:     a.user?.dni ?? null,
      latitud:           a.lat ?? null,
      longitud:          a.lng ?? null,
      direccion:         a.direccionAprox ?? null,
      registradoEn:      a.createdAt ?? null,
      estadoApp:         a.estado ?? null,
      operadorRef:       a.operadorRef ?? null,
      situacion:         null,
      jurisdiccion:      this.jurisdiccionNombre(a.lat, a.lng),
      incidenciaCecom:   incidenciaMap.get(a.id) ?? null,
    }));

    // Filtrar por jurisdicciones asignadas si aplica
    if (jurisdiccionIdsFilter?.length) {
      data = data.filter(
        (a) => a.jurisdiccion && jurisdiccionIdsFilter!.includes(a.jurisdiccion.id),
      );
      const total      = data.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const skip       = (page - 1) * limit;
      return { data: data.slice(skip, skip + limit), total, page, limit, totalPages };
    }

    return {
      data,
      total:      panicoResp?.total      ?? 0,
      page:       panicoResp?.page       ?? page,
      limit:      panicoResp?.limit      ?? limit,
      totalPages: panicoResp?.totalPages ?? 0,
    };
  }

  /** Devuelve nombre de jurisdicción a partir de coordenadas (sin lanzar error) */
  private jurisdiccionNombre(lat: number, lng: number): { id: number; nombre: string } | null {
    if (!lat || !lng) return null;
    try {
      const id = this.detectarJurisdiccionId(lat, lng);
      const jur = this.jurisdiccionesDb.find((j) => j.id === id);
      return jur ? { id: jur.id, nombre: jur.nombre ?? '' } : null;
    } catch {
      return null;
    }
  }

  private getPanicoBackendConfig() {
    const url = process.env.PANICO_BACKEND_URL;
    const key = process.env.PANICO_SERENAZGO_API_KEY;
    if (!url || !key) {
      throw new InternalServerErrorException('PANICO_BACKEND_URL o PANICO_SERENAZGO_API_KEY no configurados en el servidor');
    }
    return { url, headers: { 'x-api-key': key } };
  }

  private rethrowAxiosError(err: any): never {
    if (err?.response) {
      const body = err.response.data;
      // panico-backend usa 'mensaje' (español); APIs estándar usan 'message'
      const msg: string =
        typeof body === 'string'
          ? body
          : (body?.mensaje ?? body?.message ?? err.message ?? 'Error en panico-backend');
      throw new HttpException(msg, err.response.status);
    }
    throw new InternalServerErrorException(err?.message ?? 'Error al conectar con panico-backend');
  }

  async cambiarEstadoAlerta(panicAlertId: number, estado: string, operadorRef?: string, operadorNombre = 'Operador') {
    const { url, headers } = this.getPanicoBackendConfig();
    let resultado: any;
    try {
      const { data } = await axios.patch(
        `${url}/api/alerts/${panicAlertId}/estado`,
        { estado, operadorRef: operadorRef ?? 'cecom-operador' },
        { headers, timeout: 8000 },
      );
      resultado = data;
    } catch (err) {
      this.rethrowAxiosError(err);
    }

    // Sincronizar situacion de la incidencia CECOM antes de responder
    // (así el refetch del frontend ya encuentra el dato actualizado)
    try {
      await this.sincronizarSituacionCecom(panicAlertId, estado);
    } catch (e: any) {
      this.logger.warn(`No se pudo sincronizar situacion CECOM #${panicAlertId}: ${e.message}`);
    }

    // Notificar en tiempo real a todos los operadores conectados
    this.gateway.emitAlertaPanicoActualizada({ panicAlertId, estado, operadorNombre });

    return resultado;
  }

  private async sincronizarSituacionCecom(panicAlertId: number, estadoPanico: string) {
    const incidencia = await this.prisma.incidencia.findFirst({
      where: { descripcion: { contains: `ID Alerta App: #${panicAlertId}` } },
      select: { id: true, descripcion: true },
    });
    if (!incidencia) return;

    // Siempre actualizar la línea "Estado App: X" en la descripción
    const descActual = incidencia.descripcion ?? '';
    const nuevaDesc = descActual.includes('Estado App:')
      ? descActual.replace(/Estado App:[^\n]*/g, `Estado App: ${estadoPanico}`)
      : descActual + `\nEstado App: ${estadoPanico}`;

    // Intentar también mapear a situación interna CECOM (best-effort)
    const keywords: Record<string, string[]> = {
      ATENDIENDO: ['atendiend', 'proceso', 'curso'],
      FINALIZADA: ['atendid', 'finaliz', 'resolv'],
      FALSA:      ['falsa', 'descart', 'cerrad'],
      RECIBIDA:   ['recibid', 'pendiente', 'nuevo'],
    };
    const kws = keywords[estadoPanico] ?? [];
    let situacionId: number | undefined;
    if (kws.length) {
      const situaciones = await this.prisma.estadoIncidencia.findMany({
        where: { habilitado: true },
        select: { id: true, descripcion: true },
      });
      const match = situaciones.find((s) => {
        const d = (s.descripcion ?? '').toLowerCase();
        return kws.some((kw) => d.includes(kw));
      });
      if (match) situacionId = match.id;
    }

    await this.prisma.incidencia.update({
      where: { id: incidencia.id },
      data: {
        descripcion: nuevaDesc,
        ...(situacionId !== undefined ? { situacionId } : {}),
      },
    });

    this.logger.log(
      `Sync CECOM #${incidencia.id}: Estado App → ${estadoPanico}${situacionId ? `, situacionId → ${situacionId}` : ''}`,
    );
  }

  async bloquearUsuarioPorDni(dni: string, motivo: string, operadorRef: string, tipo = 'BLOQUEADO') {
    const { url, headers } = this.getPanicoBackendConfig();
    try {
      const { data } = await axios.patch(
        `${url}/api/users/por-dni/${dni}/bloquear`,
        { tipo, motivo, operadorRef },
        { headers, timeout: 8000 },
      );

      // Cerrar las incidencias CECOM de este vecino (sin bloquear la respuesta)
      this.cerrarIncidenciasCecomPorDni(dni).catch((e) =>
        this.logger.warn(`cerrarIncidenciasCecomPorDni(${dni}): ${e.message}`),
      );

      return data;
    } catch (err) {
      this.rethrowAxiosError(err);
    }
  }

  /** Marca como FINALIZADA todas las incidencias CECOM del vecino bloqueado */
  private async cerrarIncidenciasCecomPorDni(dni: string) {
    const incidencias = await this.prisma.incidencia.findMany({
      where: {
        medioId: this.MEDIO_ID,
        descripcion: { contains: `DNI: ${dni}` },
        NOT: { descripcion: { contains: 'Estado App: FINALIZADA' } },
      },
      select: { id: true, descripcion: true },
    });
    if (!incidencias.length) return;

    // Intentar mapear a situación CECOM terminal
    const situaciones = await this.prisma.estadoIncidencia.findMany({
      where: { habilitado: true },
      select: { id: true, descripcion: true },
    });
    const terminal = situaciones.find((s) => {
      const d = (s.descripcion ?? '').toLowerCase();
      return d.includes('atendid') || d.includes('finaliz') || d.includes('cerrad');
    });

    for (const inc of incidencias) {
      const descActual = inc.descripcion ?? '';
      const nuevaDesc = descActual.includes('Estado App:')
        ? descActual.replace(/Estado App:[^\n]*/g, 'Estado App: FINALIZADA')
        : descActual + '\nEstado App: FINALIZADA';

      await this.prisma.incidencia.update({
        where: { id: inc.id },
        data: {
          descripcion: nuevaDesc,
          ...(terminal ? { situacionId: terminal.id } : {}),
        },
      });
    }
    this.logger.log(`Auto-cerradas ${incidencias.length} incidencias CECOM para DNI ${dni}`);
  }

  async desbloquearUsuario(usuarioId: number, operadorRef: string) {
    const { url, headers } = this.getPanicoBackendConfig();
    try {
      const { data } = await axios.patch(
        `${url}/api/users/${usuarioId}/desbloquear?operadorRef=${encodeURIComponent(operadorRef)}`,
        {},
        { headers, timeout: 8000 },
      );
      return data;
    } catch (err) {
      this.rethrowAxiosError(err);
    }
  }

  async listarUsuariosApp() {
    const { url, headers } = this.getPanicoBackendConfig();
    try {
      const { data } = await axios.get(`${url}/api/users`, { headers, timeout: 8000 });
      return data;
    } catch (err) {
      this.rethrowAxiosError(err);
    }
  }

  async historialBloqueosUsuario(usuarioId: number) {
    const { url, headers } = this.getPanicoBackendConfig();
    try {
      const { data } = await axios.get(`${url}/api/users/${usuarioId}/bloqueos`, { headers, timeout: 8000 });
      return data;
    } catch (err) {
      this.rethrowAxiosError(err);
    }
  }

  async obtenerStats() {
    const { url, headers } = this.getPanicoBackendConfig();
    try {
      const { data } = await axios.get(`${url}/api/alerts/stats`, { headers, timeout: 8000 });
      // panico-backend devuelve { hoy, semana, porEstado, ultimas }
      // adaptamos al formato que espera el frontend
      const stats = data;
      const ultimas = (stats.ultimas ?? []).map((a: any) => ({
        id:               a.id,
        nombreReportante: `${a.user?.nombres ?? ''} ${a.user?.apellidos ?? ''}`.trim() || null,
        telefonoReportante: a.user?.telefono ?? null,
        direccion:        a.direccionAprox ?? null,
        registradoEn:     a.createdAt ?? null,
        jurisdiccion:     this.jurisdiccionNombre(a.lat, a.lng),
        situacion:        { descripcion: a.estado ?? null },
      }));
      return {
        hoy:             stats.hoy   ?? 0,
        semana:          stats.semana ?? 0,
        porJurisdiccion: [],   // sin info de jurisdicción en stats de panico-backend
        ultimas,
      };
    } catch (err) {
      this.rethrowAxiosError(err);
    }
  }
}
