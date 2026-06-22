import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/incidencias',
  cors: { origin: '*' },
})
export class IncidenciasGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('IncidenciasGateway');

  /** alertId → { socketId, operadorNombre } — lock en memoria, igual que SVI */
  private alertLocks = new Map<number, { socketId: string; operadorNombre: string }>();

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);

    // Adquirir lock: si ya está tomada por otro, devuelve { ok: false, tomadaPor }
    client.on('panico:join', (payload: { alertId: number; operadorNombre: string }, callback: (res: { ok: boolean; tomadaPor?: string }) => void) => {
      const existing = this.alertLocks.get(payload.alertId);
      if (existing && existing.socketId !== client.id) {
        if (typeof callback === 'function') callback({ ok: false, tomadaPor: existing.operadorNombre });
        return;
      }
      this.alertLocks.set(payload.alertId, { socketId: client.id, operadorNombre: payload.operadorNombre });
      this.server.emit('alerta-panico-tomada', { alertId: payload.alertId, operadorNombre: payload.operadorNombre });
      if (typeof callback === 'function') callback({ ok: true });
    });

    // Liberar lock voluntariamente (cierre de panel)
    client.on('panico:leave', (payload: { alertId: number }) => {
      const lock = this.alertLocks.get(payload.alertId);
      if (lock?.socketId === client.id) {
        this.alertLocks.delete(payload.alertId);
        this.server.emit('alerta-panico-liberada', { alertId: payload.alertId });
        this.logger.log(`Lock liberado: alerta #${payload.alertId} por ${lock.operadorNombre}`);
      }
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    // Auto-liberar todos los locks del socket desconectado (igual que SVI con socket_id)
    for (const [alertId, lock] of this.alertLocks.entries()) {
      if (lock.socketId === client.id) {
        this.alertLocks.delete(alertId);
        this.server.emit('alerta-panico-liberada', { alertId });
        this.logger.log(`Lock auto-liberado: alerta #${alertId} (disconnect de ${lock.operadorNombre})`);
      }
    }
  }

  emitNuevaIncidencia(incidencia: any) {
    this.server.emit('nueva-incidencia', incidencia);
  }

  emitIncidenciaActualizada(incidencia: any) {
    this.server.emit('incidencia-actualizada', incidencia);
  }

  emitIncidenciaAtendida(incidencia: any) {
    this.server.emit('incidencia-atendida', incidencia);
  }

  emitIncidenciaCerrada(incidencia: any) {
    this.server.emit('incidencia-cerrada', incidencia);
  }

  /** Notifica a todos los clientes que hay una nueva alerta del botón de pánico */
  emitNuevaAlertaPanico(alertaId: number) {
    this.server.emit('alerta-panico-nueva', { alertaId });
  }

  /** Notifica a todos los clientes que una alerta del botón de pánico cambió de estado */
  emitAlertaPanicoActualizada(payload: {
    panicAlertId: number;
    estado: string;
    operadorNombre: string;
  }) {
    this.server.emit('alerta-panico-actualizada', payload);
  }
}
