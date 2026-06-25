/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-1-search-module
 */
import { Injectable } from '@nestjs/common';
import type { FollowListPage, FollowListUser } from '@repo/types/features/follow';
import { PrismaService } from '../../prisma.service';

const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 20;

export interface SearchUsersParams {
  query: string;
  cursor?: string;
  limit?: number;
  viewerId?: string;
}

@Injectable()
export class SearchService {
  constructor(private readonly prismaService: PrismaService) {}

  async searchUsers(params: SearchUsersParams): Promise<FollowListPage> {
    const { query, cursor, viewerId } = params;
    const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const trimmed = query.trim();
    if (!trimmed) {
      return { items: [], nextCursor: null };
    }

    const users = await this.prismaService.client.user.findMany({
      where: {
        OR: [
          { username: { contains: trimmed, mode: 'insensitive' } },
          { displayName: { contains: trimmed, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
      take: limit + 1,
      orderBy: { createdAt: 'asc' },
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    });

    const hasMore = users.length > limit;
    const page = hasMore ? users.slice(0, limit) : users;

    let followedIds = new Set<string>();
    if (viewerId && page.length > 0) {
      const userIds = page.map((u) => u.id);
      const follows = await this.prismaService.client.follow.findMany({
        where: {
          followerId: viewerId,
          followingId: { in: userIds },
        },
        select: { followingId: true },
      });
      followedIds = new Set(follows.map((f) => f.followingId));
    }

    const items: FollowListUser[] = page.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      isFollowing: followedIds.has(u.id),
    }));

    const nextCursor = hasMore && page.length > 0 ? (page[page.length - 1]?.id ?? null) : null;

    return { items, nextCursor };
  }
}
