import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

const sockets: Partial<Record<'trading' | 'auctions' | 'ev', Socket>> = {};

export function getSocket(namespace: 'trading' | 'auctions' | 'ev'): Socket {
  if (!sockets[namespace]) {
    sockets[namespace] = io(`${WS_URL}/${namespace}`, { transports: ['websocket'], autoConnect: true });
  }
  return sockets[namespace]!;
}
