'use server';

import { revalidatePath } from 'next/cache';
import { createDirectMessagesClient } from '@repo/api-client/features/direct-messages';
import type {
  ConversationThread,
  InboxPage,
  SendDirectMessageResult,
  StartConversationResult,
} from '@repo/types/features/direct-messages';
import { getViewerUser } from '@/features/auth/lib/viewer';

const directMessagesClient = createDirectMessagesClient();

export const startConversationAction = async (
  otherUserId: string,
): Promise<StartConversationResult> => {
  const viewer = await getViewerUser();
  if (!viewer) {
    return { error: 'You must be signed in to start a conversation.' };
  }

  const viewerId = viewer.id;
  return directMessagesClient.getOrCreateConversation({ viewerId, otherUserId });
};

export const sendDirectMessageAction = async (
  conversationId: string,
  body: string,
): Promise<SendDirectMessageResult> => {
  const viewer = await getViewerUser();
  if (!viewer) {
    return { error: 'You must be signed in to send messages.' };
  }

  const senderId = viewer.id;
  const result = await directMessagesClient.sendMessage({ conversationId, senderId, body });

  if (result.error === undefined) {
    revalidatePath('/messages');
    revalidatePath(`/messages/${conversationId}`);
  }

  return result;
};

export const loadMoreInboxAction = async (cursor: string): Promise<InboxPage> => {
  const viewer = await getViewerUser();
  if (!viewer) {
    return { items: [], nextCursor: null };
  }

  const viewerId = viewer.id;
  return directMessagesClient.getInbox({ viewerId, cursor });
};

export const loadOlderMessagesAction = async (
  conversationId: string,
  cursor: string,
): Promise<ConversationThread | null> => {
  const viewer = await getViewerUser();
  if (!viewer) {
    return null;
  }

  const viewerId = viewer.id;
  return directMessagesClient.getConversation({ conversationId, viewerId, cursor });
};
