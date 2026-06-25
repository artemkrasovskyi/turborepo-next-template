import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

const mockQueryRaw = vi.hoisted(() => vi.fn());

vi.mock('@repo/shared/features/database', () => ({
  prisma: { $queryRawUnsafe: mockQueryRaw },
}));

describe('AppController', () => {
  let controller: AppController;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryRaw.mockResolvedValue([]);
    controller = new AppController(new AppService(new PrismaService()));
  });

  it('getHealth returns ok status and database ok', async () => {
    expect(await controller.getHealth()).toEqual({ status: 'ok', database: 'ok' });
  });
});
