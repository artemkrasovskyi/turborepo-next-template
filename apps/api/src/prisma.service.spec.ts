import { describe, it, expect, vi } from 'vitest';
import { PrismaService } from './prisma.service';

const mockPrisma = vi.hoisted(() => ({ $queryRawUnsafe: vi.fn() }));

vi.mock('@repo/shared/features/database', () => ({
  prisma: mockPrisma,
}));

describe('PrismaService', () => {
  it('exposes the shared prisma singleton as client', () => {
    const service = new PrismaService();
    expect(service.client).toBe(mockPrisma);
  });
});
