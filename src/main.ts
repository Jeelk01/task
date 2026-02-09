import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    graphqlUploadExpress({
      maxFileSize: process.env.UPLOAD_MAX_FILE_SIZE ? parseInt(process.env.UPLOAD_MAX_FILE_SIZE, 10) : 10_000_000, // 10MB
      maxFiles: 10,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true
  })

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
