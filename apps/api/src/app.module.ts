/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-0-add-prisma-to-nestJS-api-app
 * @change Backend-Phase-1-search-module
 * @change Backend-Phase-2-realtime-module
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RealtimeModule } from './features/realtime/realtime.module';
import { SearchModule } from './features/search/search.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [SearchModule, RealtimeModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
