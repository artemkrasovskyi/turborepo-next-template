import { prisma } from '@repo/shared/features/database';

type FollowParams = {
  followerId: string;
  followingId: string;
};

export function createFollowClient() {
  return {
    async follow({ followerId, followingId }: FollowParams): Promise<{ created: boolean }> {
      const existing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } },
      });

      if (existing) {
        return { created: false };
      }

      await prisma.follow.create({ data: { followerId, followingId } });
      return { created: true };
    },

    async unfollow({ followerId, followingId }: FollowParams): Promise<void> {
      await prisma.follow.deleteMany({
        where: { followerId, followingId },
      });
    },
  };
}
