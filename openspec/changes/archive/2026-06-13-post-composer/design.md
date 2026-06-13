## Context

The `feed` capability (`openspec/changes/feed`) explicitly listed "Composing posts, replies, likes, notifications" as Non-Goals. The home feed currently only displays seeded posts; there is no way for a user to create one. This design adds a post composer to the home page that lets the viewer create a new top-level post, which then appears in their feed.

Existing conventions to follow (`openspec/specs/architecture/spec.md`, and the `feed` implementation):

- Feature-first layout under `src/features/<name>/`
- `@repo/api-client` calls Prisma directly via `createXClient()` factories (see `createFeedClient`, `createUsersClient`)
- Shared types/constants live in `@repo/types/features/<name>`, exported via package.json `exports`
- Server Actions (`'use server'`) wrap api-client calls for mutations (no HTTP layer)
- `viewerId` is resolved via `createUsersClient().getViewerUser()` until `user-auth` lands
- Tailwind for styling

## Goals / Non-Goals

**Goals:**

- Let the viewer compose and submit a new top-level post from the home page
- Validate post content (non-empty, within a maximum length) on both client and server
- Persist the post via Prisma (`Post.parentId = null`, `Post.authorId = viewerId`)
- Refresh the home feed so the new post appears at the top after submission

**Non-Goals:**

- Reply composition — requires a post-detail/thread view, which doesn't exist yet (future capability)
- Editing or deleting posts — domain model states posts are immutable in MVP
- Rich text, mentions, hashtags, media/image attachments
- Optimistic client-side insertion into the feed list (rely on server-side revalidation)
- Authentication — continues to use `getViewerUser()`

## Requirements

### Requirement: Post Composition

The system SHALL let the viewer compose and submit a new top-level post containing text. The system SHALL reject empty, whitespace-only, or overlong submissions.

#### Scenario: Viewer submits a valid post

- **WHEN** the viewer submits non-empty post text within the maximum length
- **THEN** the system SHALL persist a new `Post` with `authorId` set to the viewer, `parentId` set to `null`, and `createdAt` set to the current time

#### Scenario: Viewer submits empty or whitespace-only text

- **WHEN** the viewer submits text that is empty or contains only whitespace
- **THEN** the system SHALL NOT create a post and SHALL indicate that the post cannot be empty

#### Scenario: Viewer submits text exceeding the maximum length

- **WHEN** the viewer submits text longer than the maximum post length
- **THEN** the system SHALL NOT create a post and SHALL indicate that the maximum length has been exceeded

### Requirement: Composer Feedback

The system SHALL give the viewer real-time feedback on their post's validity and submission state.

#### Scenario: Viewer types into the composer

- **WHEN** the viewer types or edits text in the composer
- **THEN** the system SHALL display the number of characters remaining out of the maximum

#### Scenario: Submission is in progress

- **WHEN** the viewer submits the composer form
- **THEN** the system SHALL disable the submit control and indicate a pending state until the submission completes

#### Scenario: Submission fails

- **WHEN** post creation fails due to validation or a server error
- **THEN** the system SHALL display an inline error message and SHALL retain the viewer's entered text

### Requirement: Feed Reflects New Posts

The system SHALL ensure a successfully created post appears in the viewer's home feed without a full page reload.

#### Scenario: New post appears at the top of the feed

- **WHEN** the viewer successfully submits a post
- **THEN** the home feed SHALL refresh and display the new post as the most recent item

## Decisions

### 1. No schema changes

The existing `Post` model (`id`, `authorId`, `body`, `parentId`, `createdAt`, `updatedAt`) already supports top-level posts via `parentId: null`. No migration is needed.

### 2. Maximum post length: 280 characters

Resolves an open question with a Twitter-style microblog convention, consistent with the "microblogging platform" framing in `openspec/specs/domain-model/spec.md`. Exported as `MAX_POST_LENGTH` from `@repo/types/features/posts` so the composer UI (client) and the server action (validation) share one source of truth.

### 3. Shared types — `packages-types/src/features/posts/index.ts`

```ts
export const MAX_POST_LENGTH = 280;

export type CreatePostInput = {
  authorId: string;
  body: string;
};
```

Add `"./features/posts": "./src/features/posts/index.ts"` to `packages-types/package.json` exports.

### 4. Posts client — `packages/api-client/src/features/posts/index.ts`

```ts
export function createPostsClient() {
  return {
    async createPost({ authorId, body }: CreatePostInput): Promise<{ id: string }> {
      return prisma.post.create({
        data: { authorId, body, parentId: null },
        select: { id: true },
      });
    },
  };
}
```

Add `"./features/posts": "./src/features/posts/index.ts"` to `packages/api-client/package.json` exports.

### 5. Server action — `apps/main/src/features/post-composer/actions.ts`

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { createPostsClient } from '@repo/api-client/features/posts';
import { MAX_POST_LENGTH } from '@repo/types/features/posts';

const postsClient = createPostsClient();

export type CreatePostResult = { id: string; error?: undefined } | { id?: undefined; error: string };

export async function createPostAction(authorId: string, body: string): Promise<CreatePostResult> {
  const trimmed = body.trim();

  if (trimmed.length === 0) {
    return { error: 'Post cannot be empty.' };
  }

  if (trimmed.length > MAX_POST_LENGTH) {
    return { error: `Post must be ${MAX_POST_LENGTH} characters or fewer.` };
  }

  const post = await postsClient.createPost({ authorId, body: trimmed });
  revalidatePath('/');
  return { id: post.id };
}
```

### 6. Composer UI — `apps/main/src/features/post-composer/components/post-composer.tsx`

Client component (`'use client'`), `useState` + `useTransition`, mirroring `LoadMoreButton`'s pending/error pattern:

- Controlled `<textarea>` with a live character counter (`{MAX_POST_LENGTH - body.length} characters left`, styled red when negative)
- Submit button disabled when empty, over the limit, or pending; label reads "Posting…" while pending
- On success: clears the textarea (the revalidated feed shows the new post below)
- On error: shows the message returned by `createPostAction`, retains the entered text
- Styled `rounded-lg border border-slate-200 bg-white p-5 shadow-sm`, matching `FeedItem`

### 7. Page integration — `apps/main/src/app/page.tsx`

Render `<PostComposer authorId={viewer.id} />` above `<FeedList viewerId={viewer.id} />`.

## Risks / Trade-offs

- [Risk] Server Actions are public endpoints; client-side validation alone is insufficient → Mitigation: `createPostAction` re-validates emptiness/length server-side (Decision 5)
- [Risk] `revalidatePath('/')` re-runs the full feed query on every post → Mitigation: acceptable at this scale (single feed query, no N+1); consistent with the existing `force-dynamic` `/` route
- [Risk] 280-character limit is an arbitrary product choice → Mitigation: centralized as `MAX_POST_LENGTH`, trivial to change later
