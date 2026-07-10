/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-3-live-notifications
 */
import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [RealtimeModule],
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
