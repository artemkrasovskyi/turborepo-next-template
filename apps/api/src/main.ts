/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-0-add-nestJS-api-app
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env['PORT'] ?? 3002;
  await app.listen(port);
}

bootstrap();
