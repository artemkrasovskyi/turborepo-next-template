import { Logger } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import { RealtimeService } from './realtime.service';

const makeRes = (writable = true): Response =>
  ({
    writable,
    write: vi.fn(),
  }) as unknown as Response;

describe('RealtimeService', () => {
  let service: RealtimeService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new RealtimeService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('connection registration', () => {
    it('registers a connection on openConnection', () => {
      const res = makeRes();
      service.openConnection(res);
      // @ts-expect-error accessing private for test assertion
      expect(service.connections.size).toBe(1);
    });

    it('returns a clientId string on openConnection', () => {
      const res = makeRes();
      const clientId = service.openConnection(res);
      expect(typeof clientId).toBe('string');
      expect(clientId.length).toBeGreaterThan(0);
    });

    it('removes the connection on closeConnection', () => {
      const res = makeRes();
      const clientId = service.openConnection(res);
      service.closeConnection(clientId);
      // @ts-expect-error accessing private for test assertion
      expect(service.connections.has(clientId)).toBe(false);
    });

    it('is a no-op when closing an unknown clientId', () => {
      expect(() => service.closeConnection('nonexistent')).not.toThrow();
    });
  });

  describe('initial connected event', () => {
    it('sends a connected event immediately on openConnection', () => {
      const res = makeRes();
      const clientId = service.openConnection(res);
      expect(res.write).toHaveBeenCalledTimes(1);
      const payload = (res.write as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(payload).toContain('event: connected');
      expect(payload).toContain(`"clientId":"${clientId}"`);
      expect(payload).toContain('"timestamp"');
    });

    it('connected event timestamp is an ISO 8601 string', () => {
      const res = makeRes();
      service.openConnection(res);
      const payload = (res.write as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      const dataLine = payload.split('\n').find((line) => line.startsWith('data:'))!;
      const data = JSON.parse(dataLine.slice('data:'.length).trim());
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });

  describe('heartbeat', () => {
    it('sends a heartbeat event after 25 seconds', () => {
      const res = makeRes();
      service.openConnection(res);
      vi.advanceTimersByTime(25_000);
      expect(res.write).toHaveBeenCalledTimes(2);
      const payload = (res.write as ReturnType<typeof vi.fn>).mock.calls[1][0] as string;
      expect(payload).toContain('event: heartbeat');
      expect(payload).toContain('"timestamp"');
    });

    it('does not include private or domain-specific data in heartbeat payload', () => {
      const res = makeRes();
      service.openConnection(res);
      vi.advanceTimersByTime(25_000);
      const payload = (res.write as ReturnType<typeof vi.fn>).mock.calls[1][0] as string;
      const dataLine = payload.split('\n').find((line) => line.startsWith('data:'))!;
      const data = JSON.parse(dataLine.slice('data:'.length).trim());
      expect(Object.keys(data)).toEqual(['timestamp']);
    });

    it('clears the heartbeat interval on closeConnection', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const res = makeRes();
      const clientId = service.openConnection(res);
      service.closeConnection(clientId);
      expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    });

    it('does not send heartbeat after connection is closed', () => {
      const res = makeRes();
      const clientId = service.openConnection(res);
      service.closeConnection(clientId);
      const callCount = (res.write as ReturnType<typeof vi.fn>).mock.calls.length;
      vi.advanceTimersByTime(25_000);
      expect(res.write).toHaveBeenCalledTimes(callCount);
    });
  });

  describe('heartbeat write error', () => {
    it('logs and cleans up connection when heartbeat cannot be written', () => {
      const loggerErrorSpy = vi.spyOn(Logger.prototype, 'error');
      let isWritable = true;
      const res = {
        get writable() {
          return isWritable;
        },
        write: vi.fn(),
      } as unknown as Response;

      const clientId = service.openConnection(res);
      isWritable = false;
      vi.advanceTimersByTime(25_000);

      // @ts-expect-error accessing private for test assertion
      expect(service.connections.has(clientId)).toBe(false);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(`clientId: ${clientId}`),
      );
    });

    it('logs and cleans up when write throws', () => {
      const loggerErrorSpy = vi.spyOn(Logger.prototype, 'error');
      let callCount = 0;
      const res = {
        get writable() {
          return true;
        },
        write: vi.fn().mockImplementation(() => {
          callCount += 1;
          if (callCount > 1) throw new Error('stream error');
        }),
      } as unknown as Response;

      const clientId = service.openConnection(res);
      vi.advanceTimersByTime(25_000);

      // @ts-expect-error accessing private for test assertion
      expect(service.connections.has(clientId)).toBe(false);
      expect(loggerErrorSpy).toHaveBeenCalled();
    });
  });
});
