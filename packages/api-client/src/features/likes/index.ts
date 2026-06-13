import { prisma } from '@repo/shared/features/database';

type LikeParams = {
  userId: string;
  postId: string;
};

export function createLikesClient() {
  return {
    async like({ userId, postId }: LikeParams): Promise<{ created: boolean }> {
      const existing = await prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (existing) {
        return { created: false };
      }

      await prisma.like.create({ data: { userId, postId } });
      return { created: true };
    },

    async unlike({ userId, postId }: LikeParams): Promise<void> {
      await prisma.like.deleteMany({
        where: { userId, postId },
      });
    },
  };
}
