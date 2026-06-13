import { prisma } from '@repo/shared/features/database';

type FollowParams = {
  followerId: string;
  followingId: string;
};

export function createFollowClient() {
  return {
    async follow({ followerId, followingId }: FollowParams): Promise<void> {
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId, followingId } },
        create: { followerId, followingId },
        update: {},
      });
    },

    async unfollow({ followerId, followingId }: FollowParams): Promise<void> {
      await prisma.follow.deleteMany({
        where: { followerId, followingId },
      });
    },
  };
}
