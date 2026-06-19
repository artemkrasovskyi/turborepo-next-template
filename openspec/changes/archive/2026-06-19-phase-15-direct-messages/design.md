## Context

Flock currently supports public social interactions: posts, replies, follows, likes, reposts,
bookmarks, notifications, and profile/search discovery. There is no private communication surface.

Phase 15 adds direct messages:
- a private inbox at `/messages`
- one-to-one conversations between users
- a conversation thread page at `/messages/[conversationId]`
- sending text messages inside a conversation

## Goals / Non-Goals

**Goals:**
- Let a signed-in viewer start or open a one-to-one conversation with another user
- Let participants send text messages in a conversation
- Add an inbox page showing the viewer's conversations ordered by latest message time
- Add a conversation page showing messages chronologically
- Restrict conversation and message access to participants only
- Reuse existing app patterns: Prisma models, `@repo/types`, `@repo/api-client`, Server Actions, and load-more pagination

**Non-Goals:**
- Group conversations
- Message attachments, images, GIFs, or rich text
- Real-time delivery, typing indicators, read receipts, or online presence
- Message deletion or editing
- Message notifications
- Blocking, spam controls, or request inboxes

## Decisions

### One-to-one conversations use explicit participant rows

Add `Conversation`, `ConversationParticipant`, and `DirectMessage` models:

```prisma
model Conversation {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastMessageAt DateTime @default(now())

  participants ConversationParticipant[]
  messages     DirectMessage[]
}

model ConversationParticipant {
  conversationId String
  userId         String
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id])

  @@id([conversationId, userId])
  @@index([userId])
}

model DirectMessage {
  id             String   @id @default(cuid())
  conversationId String
  senderId       String
  body           String
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender       User         @relation(fields: [senderId], references: [id])

  @@index([conversationId, createdAt])
  @@index([senderId, createdAt])
}
```

Use participant rows instead of `userAId/userBId` columns so access checks and future group-chat
support are straightforward. Phase 15 still enforces exactly two distinct participants per
conversation.

### Conversation uniqueness is enforced in application code

Prisma/PostgreSQL cannot express "unique unordered pair of participants" cleanly with participant
rows. `getOrCreateConversation({ viewerId, otherUserId })` should query for an existing
conversation containing both users before creating a new one in a transaction.

Because this MVP has no high-concurrency requirements, application-level uniqueness is acceptable.
If duplicates are ever created by concurrent starts, the inbox will still function; a future phase
can add a deterministic pair key.

### Direct message text reuses post length validation shape

Add direct-message-specific validation in `@repo/types/features/direct-messages`:

```ts
export const MAX_DIRECT_MESSAGE_LENGTH = 1000;
export function validateDirectMessageBody(body: string): ValidateDirectMessageBodyResult;
```

Rules:
- trim leading/trailing whitespace before storing
- reject empty or whitespace-only messages
- reject messages longer than `MAX_DIRECT_MESSAGE_LENGTH`

Messages are plain text only and render with preserved line breaks.

### API client owns access checks

Add `createDirectMessagesClient()` with:

```ts
getInbox({ viewerId, cursor, limit }): Promise<InboxPage>
getConversation({ conversationId, viewerId, cursor, limit }): Promise<ConversationThread | null>
getOrCreateConversation({ viewerId, otherUserId }): Promise<{ id: string }>
sendMessage({ conversationId, senderId, body }): Promise<DirectMessageItem>
```

Every method that reads or writes conversation data must verify that the viewer/sender is a
participant. Unauthorized access returns `null` for reads and a typed error/result for actions.

### Inbox uses last message ordering

`Conversation.lastMessageAt` is updated whenever a message is sent. The inbox orders by
`lastMessageAt desc, id desc` and shows:
- other participant avatar/name/username
- last message preview
- last message timestamp

Conversations with no messages are allowed after starting a conversation, but appear below
conversations with messages using their `lastMessageAt` creation-time default.

### Routes and UI

Add:
- `/messages` for the inbox
- `/messages/[conversationId]` for a conversation thread

Inbox entries link to the conversation route. Conversation pages render messages chronologically
with viewer/other-user alignment and a composer pinned below the message list.

Starting a conversation is available from profile pages via a `Message` button. The button calls a
Server Action to get or create the conversation, then redirects to `/messages/[conversationId]`.

### Pagination

Inbox pagination mirrors existing load-more patterns. Message history initially loads the newest
page and displays it oldest-to-newest; loading older messages prepends older items above the
current list.

## Risks / Trade-offs

- **Duplicate conversations**: application-level uniqueness can race. Acceptable for MVP; a
  deterministic participant pair key can be added later if needed.
- **No real-time updates**: users must refresh or submit a message to see new incoming messages.
  This matches the current non-real-time app architecture.
- **Participant-only access**: every direct-message query must include an explicit participant
  check; missing one would leak private messages. Tests should cover unauthorized inbox/thread/send
  cases.
