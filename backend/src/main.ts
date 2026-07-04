import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    // Disable body parser so graphql-upload can handle multipart requests
    rawBody: true,
  });

  // ─── Structured JSON Logger ───────────────────────────────────────────────
  app.useLogger(app.get(Logger));

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  });

  // ─── GraphQL File Upload Middleware ───────────────────────────────────────
  // Enables multipart/form-data uploads through GraphQL mutations.
  // Must be registered BEFORE the GraphQL handler.
  app.use(
    graphqlUploadExpress({
      maxFileSize: 50 * 1024 * 1024, // 50 MB max per file
      maxFiles: 1,
    }),
  );

  // ─── Global Validation Pipe ───────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Backend running  → http://localhost:${port}`);
  console.log(`GraphQL Playground → http://localhost:${port}/graphql`);
  console.log(`Health check     → http://localhost:${port}/health`);
}

bootstrap();
