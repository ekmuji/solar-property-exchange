import { Global, Injectable, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public readonly client: Redis;
  // Separate connection for pub/sub — a Redis connection used to SUBSCRIBE
  // can't issue other commands, so auctions/trading gateways get their own.
  public readonly publisher: Redis;
  public readonly subscriber: Redis;

  constructor(config: ConfigService) {
    const url = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    
    // Automatically apply TLS encryption if using a secure Upstash URL
    const options: RedisOptions = url.includes('upstash') 
      ? { tls: { rejectUnauthorized: false }, family: 4 } 
      : {};

    this.client = new Redis(url, options);
    this.publisher = new Redis(url, options);
    this.subscriber = new Redis(url, options);
  }

  async onModuleDestroy() {
    await Promise.all([this.client.quit(), this.publisher.quit(), this.subscriber.quit()]);
  }

  /** Cache-aside helper: read-through with TTL (seconds). */
  async cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const hit = await this.client.get(key);
    if (hit) return JSON.parse(hit) as T;
    const value = await loader();
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return value;
  }

  async invalidate(keyPattern: string) {
    const keys = await this.client.keys(keyPattern);
    if (keys.length) await this.client.del(...keys);
  }
}

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}