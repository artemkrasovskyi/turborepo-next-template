import { prisma } from '@repo/shared/features/database';
import type {
  ConversationThread,
  DirectMessageItem,
  DirectMessageUser,
  InboxConversation,
  InboxPage,
  SendDirectMessageResult,
  StartConversationResult,
} from '@repo/types/features/direct-messages';
import { validateDirectMessageBody } from '@repo/types/features/direct-messages';

type GetInboxParams = {
  viewerId: string;
  cursor?: string;
  limit?: number;
};

type GetConversationParams = {
  conversationId: string;
  viewerId: string;
  cursor?: string;
  limit?: number;
};

type GetOrCreateConversationParams = {
  viewerId: string;
  otherUserId: string;
};

type SendMessageParams = {
  conversationId: string;
  senderId: string;
  body: string;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 20;

const userSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

function mapMessage(message: {
  id: string;
  body: string;
  createdAt: Date;
  sender: DirectMessageUser;
}): DirectMessageItem {
  return {
    id: message.id,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    sender: message.sender,
  };
}

function getOtherParticipant(
  participants: { userId: string; user: DirectMessageUser }[],
  viewerId: string,
): DirectMessageUser | null {
  return participants.find((participant) => participant.userId !== viewerId)?.user ?? null;
}

export function createDirectMessagesClient() {
  return {
    async getInbox({ viewerId, cursor, limit }: GetInboxParams): Promise<InboxPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

      const conversations = await prisma.conversation.findMany({
        where: { participants: { some: { userId: viewerId } } },
        orderBy: [{ lastMessageAt: 'desc' }, { id: 'desc' }],
        take: pageSize + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          participants: {
            include: { user: { select: userSelect } },
          },
          messages: {
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: 1,
            include: { sender: { select: userSelect } },
          },
        },
      });

      const hasMore = conversations.length > pageSize;
      const pageItems = hasMore ? conversations.slice(0, pageSize) : conversations;

      const items: InboxConversation[] = pageItems.flatMap((conversation) => {
        const otherParticipant = getOtherParticipant(conversation.participants, viewerId);

        if (otherParticipant === null) {
          return [];
        }

        return [
          {
            id: conversation.id,
            createdAt: conversation.createdAt.toISOString(),
            lastMessageAt: conversation.lastMessageAt.toISOString(),
            otherParticipant,
            lastMessage: conversation.messages[0] ? mapMessage(conversation.messages[0]) : null,
          },
        ];
      });

      return {
        items,
        nextCursor: hasMore ? (pageItems[pageItems.length - 1]?.id ?? null) : null,
      };
    },

    async getConversation({
      conversationId,
      viewerId,
      cursor,
      limit,
    }: GetConversationParams): Promise<ConversationThread | null> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: { some: { userId: viewerId } },
        },
        include: {
          participants: {
            include: { user: { select: userSelect } },
          },
          messages: {
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: pageSize + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            include: { sender: { select: userSelect } },
          },
        },
      });

      if (!conversation) {
        return null;
      }

      const otherParticipant = getOtherParticipant(conversation.participants, viewerId);

      if (otherParticipant === null) {
        return null;
      }

      const hasMore = conversation.messages.length > pageSize;
      const pageItems = hasMore ? conversation.messages.slice(0, pageSize) : conversation.messages;

      return {
        id: conversation.id,
        otherParticipant,
        messages: pageItems.map(mapMessage).reverse(),
        nextCursor: hasMore ? (pageItems[pageItems.length - 1]?.id ?? null) : null,
      };
    },

    async getOrCreateConversation({
      viewerId,
      otherUserId,
    }: GetOrCreateConversationParams): Promise<StartConversationResult> {
      if (viewerId === otherUserId) {
        return { error: 'You cannot message yourself.' };
      }

      const otherUser = await prisma.user.findUnique({
        where: { id: otherUserId },
        select: { id: true },
      });

      if (!otherUser) {
        return { error: 'User not found.' };
      }

      const existing = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: viewerId } } },
            { participants: { some: { userId: otherUserId } } },
          ],
        },
        select: { id: true },
      });

      if (existing) {
        return { id: existing.id };
      }

      const conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: viewerId }, { userId: otherUserId }],
          },
        },
        select: { id: true },
      });

      return { id: conversation.id };
    },

    async sendMessage({
      conversationId,
      senderId,
      body,
    }: SendMessageParams): Promise<SendDirectMessageResult> {
      const result = validateDirectMessageBody(body);

      if (result.error !== undefined) {
        return { error: result.error };
      }

      const participant = await prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId, userId: senderId } },
        select: { conversationId: true },
      });

      if (!participant) {
        return { error: 'Conversation not found.' };
      }

      const message = await prisma.$transaction(async (tx) => {
        const created = await tx.directMessage.create({
          data: {
            conversationId,
            senderId,
            body: result.trimmed,
          },
          include: { sender: { select: userSelect } },
        });

        await tx.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: created.createdAt },
        });

        return created;
      });

      return { message: mapMessage(message) };
    },
  };
}
