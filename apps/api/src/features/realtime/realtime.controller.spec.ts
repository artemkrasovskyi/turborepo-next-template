import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { RealtimeController } from './realtime.controller';
import { RealtimeService } from './realtime.service';

const makeReq = (): Request => ({ on: vi.fn() }) as unknown as Request;

const makeRes = (): Response =>
  ({
    setHeader: vi.fn(),
    flushHeaders: vi.fn(),
  }) as unknown as Response;

describe('RealtimeController', () => {
  let controller: RealtimeController;
  let realtimeService: RealtimeService;

  beforeEach(() => {
    realtimeService = { openConnection: vi.fn().mockReturnValue('client-abc'), closeConnection: vi.fn() } as unknown as RealtimeService;
    controller = new RealtimeController(realtimeService);
  });

  describe('GET /realtime/stream SSE headers', () => {
    it('sets Content-Type to text/event-stream', () => {
      const req = makeReq();
      const res = makeRes();
      controller.stream(req, res);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    });

    it('sets Cache-Control to no-cache', () => {
      const req = makeReq();
      const res = makeRes();
      controller.stream(req, res);
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
    });

    it('sets Connection to keep-alive', () => {
      const req = makeReq();
      const res = makeRes();
      controller.stream(req, res);
      expect(res.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
    });

    it('flushes headers immediately', () => {
      const req = makeReq();
      const res = makeRes();
      controller.stream(req, res);
      expect(res.flushHeaders).toHaveBeenCalledTimes(1);
    });
  });

  describe('stream setup', () => {
    it('calls openConnection with the response and no viewerId when absent', () => {
      const req = makeReq();
      const res = makeRes();
      controller.stream(req, res, undefined);
      expect(realtimeService.openConnection).toHaveBeenCalledWith(res, undefined, undefined);
    });

    it('passes viewerId to openConnection when provided', () => {
      const req = makeReq();
      const res = makeRes();
      controller.stream(req, res, 'viewer-42');
      expect(realtimeService.openConnection).toHaveBeenCalledWith(res, 'viewer-42', undefined);
    });

    it('passes threadId to openConnection when provided', () => {
      const req = makeReq();
      const res = makeRes();
      controller.stream(req, res, undefined, 'thread-42');
      expect(realtimeService.openConnection).toHaveBeenCalledWith(res, undefined, 'thread-42');
    });

    it('passes both viewerId and threadId to openConnection when provided', () => {
      const req = makeReq();
      const res = makeRes();
      controller.stream(req, res, 'viewer-42', 'thread-42');
      expect(realtimeService.openConnection).toHaveBeenCalledWith(res, 'viewer-42', 'thread-42');
    });

    it('registers a close listener on the request', () => {
      const req = makeReq();
      const res = makeRes();
      controller.stream(req, res);
      expect(req.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('calls closeConnection with the clientId when request closes', () => {
      const req = makeReq();
      const res = makeRes();
      controller.stream(req, res);
      const closeHandler = (req.on as ReturnType<typeof vi.fn>).mock.calls[0][1] as () => void;
      closeHandler();
      expect(realtimeService.closeConnection).toHaveBeenCalledWith('client-abc');
    });
  });
});
