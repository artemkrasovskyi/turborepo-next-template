import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

const mockQueryRaw = vi.hoisted(() => vi.fn());

vi.mock('@repo/shared/features/database', () => ({
  prisma: { $queryRawUnsafe: mockQueryRaw },
}));

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AppService(new PrismaService());
  });

  it('returns database ok when Prisma query succeeds', async () => {
    mockQueryRaw.mockResolvedValueOnce([]);
    expect(await service.getHealth()).toEqual({ status: 'ok', database: 'ok' });
  });

  it('returns database error when Prisma query fails', async () => {
    mockQueryRaw.mockRejectedValueOnce(new Error('connection refused'));
    expect(await service.getHealth()).toEqual({ status: 'ok', database: 'error' });
  });
});
