/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-0-add-nestJS-api-app
 * @change Backend-Phase-2-realtime-module
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getFrontendOrigin } from './features/realtime/realtime.config';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: getFrontendOrigin() });
  const port = process.env['PORT'] ?? 3002;
  await app.listen(port);
};

bootstrap();
