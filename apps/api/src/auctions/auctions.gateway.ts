import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Namespace: /auctions
 *   socket.emit('subscribe', { auctionId })
 *   socket.on('new_bid', ({ auctionId, amount, bidderName, currentPrice }) => ...)
 *   socket.on('auction_ended', ({ auctionId, winningBidId }) => ...)
 */
@WebSocketGateway({ namespace: '/auctions', cors: { origin: '*' } })
export class AuctionsGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() body: { auctionId: string }) {
    client.join(body.auctionId);
  }

  broadcastNewBid(auctionId: string, payload: unknown) {
    this.server.to(auctionId).emit('new_bid', payload);
  }

  broadcastAuctionEnded(auctionId: string, payload: unknown) {
    this.server.to(auctionId).emit('auction_ended', payload);
  }
}
