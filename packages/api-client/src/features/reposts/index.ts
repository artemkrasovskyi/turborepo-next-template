import { prisma } from '@repo/shared/features/database';

type RepostParams = {
  userId: string;
  postId: string;
};

export function createRepostsClient() {
  return {
    async repost({ userId, postId }: RepostParams): Promise<{ created: boolean }> {
      const existing = await prisma.repost.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (existing) {
        return { created: false };
      }

      await prisma.repost.create({ data: { userId, postId } });
      return { created: true };
    },

    async unrepost({ userId, postId }: RepostParams): Promise<void> {
      await prisma.repost.deleteMany({
        where: { userId, postId },
      });
    },
  };
}
