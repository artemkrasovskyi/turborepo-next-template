/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-0-add-prisma-to-nestJS-api-app
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
