/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-2-realtime-module
 */
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Response } from 'express';

const HEARTBEAT_INTERVAL_MS = 25_000;

interface Connection {
  res: Response;
  heartbeatTimer: ReturnType<typeof setInterval>;
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  private readonly connections = new Map<string, Connection>();

  openConnection(res: Response): string {
    const clientId = randomUUID();

    RealtimeService.sendEvent(res, 'connected', { clientId, timestamp: new Date().toISOString() });

    const heartbeatTimer = setInterval(() => {
      const ok = RealtimeService.sendEvent(res, 'heartbeat', { timestamp: new Date().toISOString() });
      if (!ok) {
        this.logger.error(`Heartbeat write error for clientId: ${clientId}`);
        this.closeConnection(clientId);
      }
    }, HEARTBEAT_INTERVAL_MS);

    this.connections.set(clientId, { res, heartbeatTimer });
    this.logger.log(`Connection opened: clientId=${clientId}`);

    return clientId;
  }

  closeConnection(clientId: string): void {
    const connection = this.connections.get(clientId);
    if (!connection) return;
    clearInterval(connection.heartbeatTimer);
    this.connections.delete(clientId);
    this.logger.log(`Connection closed: clientId=${clientId}`);
  }

  private static sendEvent(res: Response, event: string, data: unknown): boolean {
    if (!res.writable) return false;
    try {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      return true;
    } catch {
      return false;
    }
  }
}
