// src/redis/redis.service.ts
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClient;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('redis.host');
    const port = this.config.get<number>('redis.port');
    const password = this.config.get<string>('redis.password');
    const db = this.config.get<number>('redis.db');
    const tls = this.config.get<boolean>('redis.tls');

    this.client = new Redis({
      host,
      port,
      password,
      db,
      tls: tls ? {} : undefined,
      maxRetriesPerRequest: null,
      reconnectOnError: () => true,
    });

    this.client.on('connect', () =>
      this.logger.log(`✔️  Connected to Redis → ${host}:${port} db=${db}`),
    );

    this.client.on('error', (err) =>
      this.logger.error('Redis error', err.stack),
    );

    this.client.on('reconnecting', () =>
      this.logger.warn('Redis reconnecting...'),
    );
  }

  getClient(): RedisClient {
    return this.client;
  }


  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis connection closed');
  }

  // -------------- STRING HELPERS --------------

  async set(
    key: string,
    value: any,
    ttlSeconds?: number,
  ): Promise<void> {
    const str =
      typeof value === 'string' ? value : JSON.stringify(value);

    ttlSeconds
      ? await this.client.set(key, str, 'EX', ttlSeconds)
      : await this.client.set(key, str);
  }

  async get<T = string>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl);
  }

  // -------------- SET HELPERS (for jti sessions) --------------

  async sadd(key: string, member: string): Promise<void> {
    await this.client.sadd(key, member);
  }

  async srem(key: string, member: string): Promise<void> {
    await this.client.srem(key, member);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    return (await this.client.sismember(key, member)) === 1;
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async scard(key: string): Promise<number> {
    return this.client.scard(key);
  }

  // -------------- HASH HELPERS (session meta) --------------

  async hset(key: string, value: Record<string, any>): Promise<void> {
    await this.client.hset(key, value);
  }

  async hgetall<T = any>(key: string): Promise<T | null> {
    const res = await this.client.hgetall(key);
    return Object.keys(res).length ? (res as T) : null;
  }

  // -------------- HEALTH CHECK --------------

  async ping(): Promise<boolean> {
    return (await this.client.ping()) === 'PONG';
  }
}
