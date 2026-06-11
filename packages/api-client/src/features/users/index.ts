import { prisma } from '@repo/shared/features/database';
import type { ViewerUser } from '@repo/types/features/users';

export function createUsersClient() {
  return {
    async getViewerUser(): Promise<ViewerUser | null> {
      return prisma.user.findFirst({
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      });
    },
  };
}
