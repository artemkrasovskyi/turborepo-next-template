/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-4-live-replies
 */
import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { RepliesService } from './replies.service';

@Module({
  imports: [RealtimeModule],
  providers: [RepliesService, PrismaService],
  exports: [RepliesService],
})
export class RepliesModule {}
