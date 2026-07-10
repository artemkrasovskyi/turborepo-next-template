/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-2-realtime-module
 * @change Backend-Phase-3-live-notifications
 */
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Response } from 'express';

const HEARTBEAT_INTERVAL_MS = 25_000;

interface Connection {
  res: Response;
  heartbeatTimer: ReturnType<typeof setInterval>;
  viewerId?: string;
}

export type PublishResult = { sent: number; failed: number };

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  private readonly connections = new Map<string, Connection>();

  private readonly viewerConnections = new Map<string, Set<string>>();

  openConnection(res: Response, viewerId?: string): string {
    const clientId = randomUUID();

    RealtimeService.sendEvent(res, 'connected', { clientId, timestamp: new Date().toISOString() });

    const heartbeatTimer = setInterval(() => {
      const ok = RealtimeService.sendEvent(res, 'heartbeat', { timestamp: new Date().toISOString() });
      if (!ok) {
        this.logger.error(`Heartbeat write error for clientId: ${clientId}`);
        this.closeConnection(clientId);
      }
    }, HEARTBEAT_INTERVAL_MS);

    this.connections.set(clientId, { res, heartbeatTimer, viewerId });

    if (viewerId) {
      if (!this.viewerConnections.has(viewerId)) {
        this.viewerConnections.set(viewerId, new Set());
      }
      this.viewerConnections.get(viewerId)!.add(clientId);
    }

    this.logger.log(`Connection opened: clientId=${clientId}`);

    return clientId;
  }

  closeConnection(clientId: string): void {
    const connection = this.connections.get(clientId);
    if (!connection) return;
    clearInterval(connection.heartbeatTimer);
    this.connections.delete(clientId);

    if (connection.viewerId) {
      const viewerSet = this.viewerConnections.get(connection.viewerId);
      if (viewerSet) {
        viewerSet.delete(clientId);
        if (viewerSet.size === 0) {
          this.viewerConnections.delete(connection.viewerId);
        }
      }
    }

    this.logger.log(`Connection closed: clientId=${clientId}`);
  }

  publishToUser(userId: string, event: string, data: unknown): PublishResult {
    const clientIds = this.viewerConnections.get(userId);
    if (!clientIds || clientIds.size === 0) return { sent: 0, failed: 0 };

    return [...clientIds].reduce<PublishResult>(
      (result, clientId) => {
        const connection = this.connections.get(clientId);
        if (!connection) return result;

        const ok = RealtimeService.sendEvent(connection.res, event, data);
        if (ok) return { ...result, sent: result.sent + 1 };

        this.logger.error(`Publish write error for clientId: ${clientId}, event: ${event}`);
        this.closeConnection(clientId);
        return { ...result, failed: result.failed + 1 };
      },
      { sent: 0, failed: 0 },
    );
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
