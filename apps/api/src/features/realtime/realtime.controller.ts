/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-2-realtime-module
 * @change Backend-Phase-4-live-replies
 */
import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { RealtimeService } from './realtime.service';

@Controller('realtime')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Get('stream')
  stream(
    @Req() req: Request,
    @Res() res: Response,
    @Query('viewerId') viewerId?: string,
    @Query('threadId') threadId?: string,
  ): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = this.realtimeService.openConnection(res, viewerId, threadId);

    req.on('close', () => {
      this.realtimeService.closeConnection(clientId);
    });
  }
}
