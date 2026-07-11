/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-0-add-prisma-to-nestJS-api-app
 * @change Backend-Phase-1-search-module
 * @change Backend-Phase-2-realtime-module
 * @change Backend-Phase-3-live-notifications
 * @change Backend-Phase-4-live-replies
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationsModule } from './features/notifications/notifications.module';
import { RealtimeModule } from './features/realtime/realtime.module';
import { RepliesModule } from './features/replies/replies.module';
import { SearchModule } from './features/search/search.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [SearchModule, RealtimeModule, NotificationsModule, RepliesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
