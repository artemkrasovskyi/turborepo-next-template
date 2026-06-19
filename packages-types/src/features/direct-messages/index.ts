export const MAX_DIRECT_MESSAGE_LENGTH = 1000;

export type ValidateDirectMessageBodyResult =
  | { trimmed: string; error?: undefined }
  | { trimmed?: undefined; error: string };

export function validateDirectMessageBody(body: string): ValidateDirectMessageBodyResult {
  const trimmed = body.trim();

  if (trimmed.length === 0) {
    return { error: 'Message cannot be empty.' };
  }

  if (trimmed.length > MAX_DIRECT_MESSAGE_LENGTH) {
    return { error: `Message must be ${MAX_DIRECT_MESSAGE_LENGTH} characters or fewer.` };
  }

  return { trimmed };
}

export type DirectMessageUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type DirectMessageItem = {
  id: string;
  body: string;
  createdAt: string;
  sender: DirectMessageUser;
};

export type InboxConversation = {
  id: string;
  createdAt: string;
  lastMessageAt: string;
  otherParticipant: DirectMessageUser;
  lastMessage: DirectMessageItem | null;
};

export type InboxPage = {
  items: InboxConversation[];
  nextCursor: string | null;
};

export type ConversationThread = {
  id: string;
  otherParticipant: DirectMessageUser;
  messages: DirectMessageItem[];
  nextCursor: string | null;
};

export type StartConversationResult =
  | { id: string; error?: undefined }
  | { id?: undefined; error: string };

export type SendDirectMessageResult =
  | { message: DirectMessageItem; error?: undefined }
  | { message?: undefined; error: string };
