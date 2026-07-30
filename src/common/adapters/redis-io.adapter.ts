import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly logger = new Logger(RedisIoAdapter.name);

  async connectToRedis(config: ConfigService): Promise<void> {
    const host = config.get<string>('redis.host') || '127.0.0.1';
    const port = config.get<number>('redis.port') || 6379;
    const password = config.get<string>('redis.password');
    const db = config.get<number>('redis.db') || 0;
    const tls = config.get<boolean>('redis.tls');

    const redisOptions = {
      host,
      port,
      password,
      db,
      tls: tls ? {} : undefined,
      maxRetriesPerRequest: null,
      reconnectOnError: () => true,
      lazyConnect: true, // Allow manual connect() call below
    };

    const pubClient = new Redis(redisOptions);
    const subClient = new Redis(redisOptions);

    await Promise.all([pubClient.connect(), subClient.connect()]).catch(
      (err) => {
        this.logger.error(
          'Failed to connect to Redis for Socket.io adapter',
          err,
        );
      },
    );

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    this.logger.log(
      `Socket.io server started on port ${port} with Redis adapter`,
    );
    return server;
  }
}
