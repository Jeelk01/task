import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Fix 1: Global validation pipe — ensures class-validator decorators run on all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Auto-transform payload types
    }),
  );

  app.use(
    graphqlUploadExpress({
      maxFileSize: process.env.UPLOAD_MAX_FILE_SIZE
        ? parseInt(process.env.UPLOAD_MAX_FILE_SIZE, 10)
        : 10_000_000,
      maxFiles: 10,
    }),
  );

  // Fix 8: CORS origin from environment variable
  // const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.enableCors({
    origin: '*', // Allow all origins for development; restrict in production
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const configService = app.get(ConfigService);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis(configService);
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
