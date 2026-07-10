/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-2-realtime-module
 */
import { Module } from '@nestjs/common';
import { RealtimeController } from './realtime.controller';
import { RealtimeService } from './realtime.service';

@Module({
  controllers: [RealtimeController],
  providers: [RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
