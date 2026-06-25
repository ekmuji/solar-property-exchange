import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * Namespace: /trading
 * Client flow:
 *   socket.emit('subscribe', { warehouseId })   // joins a room for that warehouse's book (or "global")
 *   socket.on('order_book', (book) => ...)       // full snapshot on subscribe
 *   socket.on('trade_executed', (fill) => ...)   // pushed whenever TradingService.placeOrder produces fills
 */
@WebSocketGateway({ namespace: '/trading', cors: { origin: '*' } })
export class TradingGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('TradingGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() body: { warehouseId?: string }) {
    const room = body?.warehouseId ?? 'global';
    client.join(room);
  }

  /** Called by TradingController after a successful placeOrder(). */
  broadcastTrade(warehouseId: string | undefined, payload: unknown) {
    this.server.to(warehouseId ?? 'global').emit('trade_executed', payload);
  }

  broadcastOrderBook(warehouseId: string | undefined, book: unknown) {
    this.server.to(warehouseId ?? 'global').emit('order_book', book);
  }
}
