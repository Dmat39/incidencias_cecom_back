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

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
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
}
