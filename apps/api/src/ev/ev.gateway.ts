import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Namespace: /ev
 *   socket.emit('subscribe', { warehouseId })
 *   socket.on('charger_status', ({ chargerId, status }) => ...)
 */
@WebSocketGateway({ namespace: '/ev', cors: { origin: '*' } })
export class EvGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() body: { warehouseId: string }) {
    client.join(body.warehouseId);
  }

  broadcastChargerStatus(warehouseId: string, payload: unknown) {
    this.server.to(warehouseId).emit('charger_status', payload);
  }
}
