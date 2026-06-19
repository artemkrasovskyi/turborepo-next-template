## 1. Prisma Schema

- [x] 1.1 Add `Conversation` model with `id`, `createdAt`, `updatedAt`, `lastMessageAt`, `participants`, and `messages`
- [x] 1.2 Add `ConversationParticipant` model with `conversationId`, `userId`, `createdAt`, compound id, and `@@index([userId])`
- [x] 1.3 Add `DirectMessage` model with `id`, `conversationId`, `senderId`, `body`, `createdAt`, and indexes for conversation and sender history
- [x] 1.4 Add `conversations ConversationParticipant[]` and `directMessages DirectMessage[]` relations to `User`
- [x] 1.5 Run `bun run db:migrate --name add_direct_messages`
- [x] 1.6 Run `bun run db:generate`

## 2. Shared Types

- [x] 2.1 Create `packages-types/src/features/direct-messages/index.ts`
- [x] 2.2 Export `MAX_DIRECT_MESSAGE_LENGTH = 1000`
- [x] 2.3 Export `validateDirectMessageBody(body)` that trims, rejects empty text, and rejects over-limit text
- [x] 2.4 Define `DirectMessageUser`, `InboxConversation`, `InboxPage`, `DirectMessageItem`, `ConversationThread`, and send/start result types
- [x] 2.5 Add `"./features/direct-messages"` to `packages-types/package.json` exports
- [x] 2.6 Add unit tests for direct-message body validation

## 3. API Client

- [x] 3.1 Create `packages/api-client/src/features/direct-messages/index.ts` with `createDirectMessagesClient()`
- [x] 3.2 Implement `getInbox({ viewerId, cursor, limit })` ordered by `lastMessageAt desc, id desc`
- [x] 3.3 Implement `getConversation({ conversationId, viewerId, cursor, limit })` with participant access check and newest-page message pagination displayed chronologically
- [x] 3.4 Implement `getOrCreateConversation({ viewerId, otherUserId })`, rejecting self-conversations and unknown users
- [x] 3.5 Implement `sendMessage({ conversationId, senderId, body })`, validating body, checking participant access, creating the message, and updating `Conversation.lastMessageAt` in one transaction
- [x] 3.6 Add `"./features/direct-messages"` to `packages/api-client/package.json` exports
- [ ] 3.7 Add API-client tests for inbox ordering, participant access, self-conversation rejection, send validation, and `lastMessageAt` updates

## 4. Server Actions

- [x] 4.1 Create `apps/main/src/features/direct-messages/actions.ts`
- [x] 4.2 Add `startConversationAction(viewerId, otherUserId)` that returns or redirects to the conversation id
- [x] 4.3 Add `sendDirectMessageAction(conversationId, senderId, body)` with typed validation errors
- [x] 4.4 Add `loadMoreInboxAction(viewerId, cursor)`
- [x] 4.5 Add `loadOlderMessagesAction(conversationId, viewerId, cursor)`
- [x] 4.6 Revalidate `/messages` and the active conversation route after successful sends

## 5. Inbox UI

- [x] 5.1 Create `apps/main/src/app/messages/page.tsx` with `dynamic = 'force-dynamic'`
- [x] 5.2 Render signed-out/no-viewer empty state when no viewer exists
- [x] 5.3 Create inbox list components showing other participant, last message preview, and timestamp
- [x] 5.4 Add inbox load-more component using existing pagination button patterns
- [x] 5.5 Create `apps/main/src/app/messages/loading.tsx`
- [x] 5.6 Add `Messages` link to the main nav

## 6. Conversation UI

- [x] 6.1 Create `apps/main/src/app/messages/[conversationId]/page.tsx` with participant-only access
- [x] 6.2 Render conversation header with the other participant's display name and username
- [x] 6.3 Render messages chronologically with viewer/other-user alignment and preserved line breaks
- [x] 6.4 Create direct-message composer with validation error display and pending state
- [x] 6.5 Add "load older" support for message history
- [x] 6.6 Create `apps/main/src/app/messages/[conversationId]/loading.tsx`

## 7. Profile Entry Point

- [x] 7.1 Add `Message` button to profile headers when a viewer is present and the profile is not the viewer's own profile
- [x] 7.2 Wire the button to `startConversationAction`
- [x] 7.3 Redirect successful starts to `/messages/[conversationId]`

## 8. Verification

- [x] 8.1 Run `bun run typecheck`
- [ ] 8.2 Run `bun run lint`
- [x] 8.3 Run direct-message validation tests and focused lint for new API/types files
- [ ] 8.4 Manually verify starting a conversation from another user's profile
- [ ] 8.5 Manually verify sending a message updates the conversation and inbox ordering
- [ ] 8.6 Manually verify a non-participant cannot open or send to a conversation
