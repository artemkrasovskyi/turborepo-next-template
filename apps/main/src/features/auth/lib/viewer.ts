import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { prisma } from '@repo/shared/features/database';
import type { ViewerUser } from '@repo/types/features/users';
import { auth } from './auth';

export const getViewerUser = cache(async (): Promise<ViewerUser | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  });
});

export async function requireViewerUser(): Promise<ViewerUser> {
  const viewer = await getViewerUser();

  if (!viewer) {
    redirect('/sign-in');
  }

  return viewer;
}
