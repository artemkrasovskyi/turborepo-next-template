/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @openspec openspec/specs/thread-page/spec.md
 * @change Backend-Phase-4-live-replies
 */
import { Injectable } from '@nestjs/common';
import type { CreateReplyInput, ThreadPost } from '@repo/types/features/posts';
import { PrismaService } from '../../prisma.service';
import { RealtimeService } from '../realtime/realtime.service';

const AUTHOR_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

const REPLY_INCLUDE = {
  author: { select: AUTHOR_SELECT },
  images: { select: { id: true, url: true, order: true }, orderBy: { order: 'asc' as const } },
} as const;

type ReplyRow = {
  id: string;
  body: string;
  createdAt: Date;
  author: { id: string; username: string; displayName: string; avatarUrl: string | null };
  images: { id: string; url: string; order: number }[];
};

const toThreadPost = (row: ReplyRow): ThreadPost => ({
  id: row.id,
  body: row.body,
  createdAt: row.createdAt.toISOString(),
  author: row.author,
  likeCount: 0,
  isLikedByViewer: false,
  isBookmarkedByViewer: false,
  images: row.images,
});

@Injectable()
export class RepliesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async createReply({
    authorId,
    parentId,
    body,
    imageUrls = [],
  }: CreateReplyInput): Promise<{ id: string }> {
    const replyRow = await this.persistReply({ authorId, parentId, body, imageUrls });

    this.realtimeService.publishToThread(parentId, 'reply.created', {
      threadId: parentId,
      reply: toThreadPost(replyRow),
      timestamp: new Date().toISOString(),
    });

    return { id: replyRow.id };
  }

  private async persistReply({
    authorId,
    parentId,
    body,
    imageUrls,
  }: {
    authorId: string;
    parentId: string;
    body: string;
    imageUrls: string[];
  }): Promise<ReplyRow> {
    if (imageUrls.length === 0) {
      return this.prismaService.client.post.create({
        data: { authorId, parentId, body },
        include: REPLY_INCLUDE,
      });
    }

    return this.prismaService.client.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: { authorId, parentId, body },
        select: { id: true },
      });
      await tx.postImage.createMany({
        data: imageUrls.map((url, order) => ({ postId: post.id, url, order })),
      });
      return tx.post.findUniqueOrThrow({
        where: { id: post.id },
        include: REPLY_INCLUDE,
      });
    });
  }
}
