'use server';

import { revalidatePath } from 'next/cache';
import { createDirectMessagesClient } from '@repo/api-client/features/direct-messages';
import type {
  ConversationThread,
  InboxPage,
  SendDirectMessageResult,
  StartConversationResult,
} from '@repo/types/features/direct-messages';

const directMessagesClient = createDirectMessagesClient();

export async function startConversationAction(
  viewerId: string,
  otherUserId: string,
): Promise<StartConversationResult> {
  return directMessagesClient.getOrCreateConversation({ viewerId, otherUserId });
}

export async function sendDirectMessageAction(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<SendDirectMessageResult> {
  const result = await directMessagesClient.sendMessage({ conversationId, senderId, body });

  if (result.error === undefined) {
    revalidatePath('/messages');
    revalidatePath(`/messages/${conversationId}`);
  }

  return result;
}

export async function loadMoreInboxAction(viewerId: string, cursor: string): Promise<InboxPage> {
  return directMessagesClient.getInbox({ viewerId, cursor });
}

export async function loadOlderMessagesAction(
  conversationId: string,
  viewerId: string,
  cursor: string,
): Promise<ConversationThread | null> {
  return directMessagesClient.getConversation({ conversationId, viewerId, cursor });
}
