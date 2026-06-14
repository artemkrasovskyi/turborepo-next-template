import { cache } from 'react';
import { prisma } from '@repo/shared/features/database';
import type { ViewerUser } from '@repo/types/features/users';

const getCachedViewerUser = cache(
  (): Promise<ViewerUser | null> =>
    prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
    }),
);

export function createUsersClient() {
  return {
    getViewerUser: getCachedViewerUser,
  };
}
