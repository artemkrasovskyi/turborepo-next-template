## Context

The domain model (`openspec/specs/domain-model/spec.md`) defines `Like`:

> A like represents a user's reaction to a post. A user may like a post only once. Like counts are derived from Like relationships.

The `thread-page` design explicitly listed this as out of scope:

> Likes, notifications — separate capabilities, not built here

Posts are currently rendered with no reaction affordance anywhere they appear: the home feed (`FeedItem`), thread pages (`PostCard` for the root post and replies), and profile post lists (which reuse `FeedItem`). This change adds a `Like` model and a like/unlike toggle on posts in all three places.

Existing conventions to follow (`openspec/specs/architecture/spec.md`, and the `feed`/`thread-page`/`profile-page`/`follow-system` implementations):

- Feature-first layout under `src/features/<name>/`
- `@repo/api-client` calls Prisma directly via `createXClient()` factories
- Shared types live in `@repo/types/features/<name>`, exported via package.json `exports`
- Server Actions (`'use server'`) wrap api-client mutations
- Client components use `useState` + `useTransition`, mirroring `FollowButton`'s optimistic toggle pattern
- `viewerId` is resolved via `createUsersClient().getViewerUser()` until `user-auth` lands
- `getProfileByUsername` and `ProfileHeader` already accept an optional/nullable `viewerId` to compute viewer-relative state (`isFollowing`); `getThread` and `getProfilePosts` do not yet take a `viewerId`
- Idempotent toggles via Prisma `upsert` (like) / `deleteMany` (unlike), as established by `createFollowClient()`
- Tailwind styling matching `FeedItem`/`PostCard`/`FollowButton` (`rounded-lg border border-slate-200 bg-white p-5 shadow-sm`, teal accent, `text-sm text-slate-500` for secondary metadata)

## Goals / Non-Goals

**Goals:**

- Add a `Like` model so a viewer can like and unlike any post (root post or reply)
- Make liking and unliking idempotent — liking an already-liked post or unliking a not-liked post is a no-op, not an error
- Show each post's like count and the viewer's like state (liked / not liked) wherever posts are rendered: home feed, thread page (root + replies), and profile post lists
- Let the viewer toggle a like from any of those places without a full page reload, with optimistic UI and error rollback

**Non-Goals:**

- Like notifications — separate `notifications` capability per the domain model
- A "Liked posts" tab/list on a profile — future capability
- Showing *who* liked a post (a list of likers)
- Restricting likes on a user's own posts — the domain model places no such restriction (unlike follow, which forbids self-follow)
- Authentication — continues to use `getViewerUser()`; when no viewer is resolved, like counts are still shown but without an interactive control

## Requirements

### Requirement: Like and Unlike a Post

The system SHALL let a viewer like and unlike any post (root post or reply), and SHALL make both operations idempotent.

#### Scenario: Viewer likes a post they haven't liked

- **WHEN** the viewer likes a post they have not already liked
- **THEN** the system SHALL create a `Like` record with `userId` set to the viewer and `postId` set to that post

#### Scenario: Viewer unlikes a post they've liked

- **WHEN** the viewer unlikes a post they have already liked
- **THEN** the system SHALL remove the corresponding `Like` record

#### Scenario: Viewer likes a post they've already liked

- **WHEN** the viewer likes a post they have already liked
- **THEN** the system SHALL NOT create a duplicate `Like` record and SHALL NOT return an error

#### Scenario: Viewer unlikes a post they haven't liked

- **WHEN** the viewer unlikes a post they have not liked
- **THEN** the system SHALL NOT return an error

### Requirement: Like State and Count Display

The system SHALL display each post's like count, and SHALL indicate whether the viewer has liked it, on the home feed, thread pages, and profile post lists.

#### Scenario: Post is rendered with a viewer

- **WHEN** a post is rendered in the feed, a thread, or a profile's post list, and a viewer is resolved
- **THEN** the system SHALL display its like count and SHALL visually distinguish whether the viewer has liked it

#### Scenario: Post is rendered with no viewer

- **WHEN** a post is rendered and no viewer is resolved
- **THEN** the system SHALL display its like count without an interactive like control

### Requirement: Like Toggle Feedback

The system SHALL let the viewer toggle a post's like state from wherever it is rendered, updating the displayed state and count without a full page reload.

#### Scenario: Viewer toggles a like

- **WHEN** the viewer activates a post's like control
- **THEN** the system SHALL immediately update the displayed like state and count, then persist the change in the background

#### Scenario: Toggling fails

- **WHEN** a like or unlike action fails
- **THEN** the system SHALL revert the displayed like state and count to their previous values and display an inline error message

## Decisions

### 1. Schema — add a `Like` model

```prisma
model Like {
  userId    String
  postId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])

  @@id([userId, postId])
  @@index([postId])
}
```

Add the back-relations:

```prisma
model User {
  // ...existing fields...
  likes Like[]
}

model Post {
  // ...existing fields...
  likes Like[]
}
```

The composite `@@id([userId, postId])` mirrors `Follow`'s `@@id([followerId, followingId])` and enforces "a user may like a post only once" at the database level, giving Prisma a generated `userId_postId` compound-key argument for `upsert`. `@@index([postId])` supports the per-post `_count` aggregation and the "did the viewer like this post" lookup used on the feed, thread, and profile queries. Run `bun run db:migrate --name add_like_model` to generate the migration.

### 2. Shared types — `packages-types/src/features/likes/index.ts`

```ts
export type ToggleLikeResult =
  | { isLiked: boolean; error?: undefined }
  | { isLiked?: undefined; error: string };
```

Mirrors `ToggleFollowResult`. Add `"./features/likes": "./src/features/likes/index.ts"` to `packages-types/package.json` exports.

### 3. Likes client — `packages/api-client/src/features/likes/index.ts`

```ts
import { prisma } from '@repo/shared/features/database';

type LikeParams = {
  userId: string;
  postId: string;
};

export function createLikesClient() {
  return {
    async like({ userId, postId }: LikeParams): Promise<void> {
      await prisma.like.upsert({
        where: { userId_postId: { userId, postId } },
        create: { userId, postId },
        update: {},
      });
    },

    async unlike({ userId, postId }: LikeParams): Promise<void> {
      await prisma.like.deleteMany({
        where: { userId, postId },
      });
    },
  };
}
```

Same idempotency rationale as `createFollowClient()`: `upsert` avoids a `P2002` unique-constraint error on a repeat like; `deleteMany` avoids a "record not found" error on a repeat unlike. Add `"./features/likes": "./src/features/likes/index.ts"` to `packages/api-client/package.json` exports.

### 4. Extend `FeedPost` / `ThreadPost` with `likeCount` and `isLikedByViewer`

`packages-types/src/features/feed/index.ts`:

```ts
export type FeedPost = {
  id: string;
  body: string;
  createdAt: string;
  author: FeedAuthor;
  replyCount: number;
  likeCount: number;
  isLikedByViewer: boolean;
};
```

`packages-types/src/features/posts/index.ts`:

```ts
export type ThreadPost = {
  id: string;
  body: string;
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  isLikedByViewer: boolean;
};
```

Three queries populate these fields, all following the same shape — add to `include`:

```ts
_count: { select: { replies: true, likes: true } }, // replies only on feed/profile queries
likes: { where: { userId: viewerId ?? '' }, select: { userId: true }, take: 1 },
```

and map:

```ts
likeCount: post._count.likes,
isLikedByViewer: post.likes.length > 0,
```

Using `viewerId ?? ''` keeps the `include` shape (and therefore the inferred Prisma result type) identical regardless of whether a viewer is present — an empty-string `userId` never matches a real `Like` row, so `isLikedByViewer` is simply `false` when there's no viewer. This avoids a conditional `include` and the type-inference complications that come with it.

- **`getHomeFeed`** (`packages/api-client/src/features/feed/index.ts`) already requires `viewerId` — apply the addition above directly.
- **`getThread`** (`packages/api-client/src/features/posts/index.ts`) gains an optional `viewerId?: string` param: `getThread({ postId, viewerId }: { postId: string; viewerId?: string })`. Both the root `findFirst` and the replies `findMany` get the `include` addition; `toThreadPost` maps the two new fields.
- **`getProfilePosts`** (`packages/api-client/src/features/profile/index.ts`) gains an optional `viewerId?: string` param: `getProfilePosts({ userId, viewerId, cursor, limit })`.

### 5. Server action — `apps/main/src/features/likes/actions.ts`

```ts
'use server';

import { createLikesClient } from '@repo/api-client/features/likes';
import type { ToggleLikeResult } from '@repo/types/features/likes';

const likesClient = createLikesClient();

export async function toggleLikeAction(
  userId: string,
  postId: string,
  nextIsLiked: boolean,
): Promise<ToggleLikeResult> {
  if (nextIsLiked) {
    await likesClient.like({ userId, postId });
  } else {
    await likesClient.unlike({ userId, postId });
  }

  return { isLiked: nextIsLiked };
}
```

No `revalidatePath` call: unlike follow (where a toggle changes counts shown in a different part of the page — the header) or replies (where a toggle adds a new list item), a like toggle only changes the count and state shown on the `LikeButton` itself, which already owns and updates that display optimistically. No other rendered element depends on a post's like count.

### 6. `LikeButton` — `apps/main/src/features/likes/components/like-button.tsx`

Client component (`'use client'`), `useState` + `useTransition`, mirroring `FollowButton`'s optimistic toggle pattern:

```ts
type LikeButtonProps = {
  viewerId: string | null;
  postId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
};
```

- If `viewerId === null`, render a static (non-interactive) `<span>` showing the heart glyph and `initialLikeCount` — satisfies the "no viewer" display requirement
- Otherwise render a `<button>`:
  - On click: optimistically flip local `isLiked` and adjust local `likeCount` by `+1`/`-1`, then call `toggleLikeAction(viewerId, postId, next)`
  - On error: revert both `isLiked` and `likeCount` to their pre-click values and show an inline `text-red-600` message, matching `FollowButton`
  - `disabled={isPending}`, consistent with `FollowButton`/`LoadMoreButton`
- Styling: a heart glyph (`♥` filled / `♡` outline) followed by the count, `text-sm`; liked state uses `text-rose-600`, unliked uses `text-slate-500 hover:text-rose-600` — a lighter-weight control than `FollowButton`, consistent with the reply-count link's styling in `FeedItem`

### 7. Feed integration

`FeedItem` (`apps/main/src/features/feed/components/feed-item.tsx`) gains a `viewerId: string | null` prop. The body and reply-count are currently both inside a single `<Link href="/posts/${id}">`; pull the reply-count out into its own footer row alongside `LikeButton` (two interactive elements can't both live inside an anchor):

```tsx
<Link href={`/posts/${post.id}`} className="mt-3 block">
  <p className="whitespace-pre-wrap text-base leading-7 text-slate-800">{post.body}</p>
</Link>
<div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
  <Link href={`/posts/${post.id}`} className="hover:underline">
    {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
  </Link>
  <LikeButton
    viewerId={viewerId}
    postId={post.id}
    initialIsLiked={post.isLikedByViewer}
    initialLikeCount={post.likeCount}
  />
</div>
```

`FeedList` and `LoadMoreButton` (`apps/main/src/features/feed/components/`) already receive `viewerId: string` from the feed page — thread it through to each `FeedItem`.

### 8. Thread page integration

`PostCard` (`apps/main/src/features/post-thread/components/post-card.tsx`) gains a `viewerId: string | null` prop and renders `LikeButton` below the body:

```tsx
<p className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-800">{post.body}</p>
<div className="mt-3">
  <LikeButton
    viewerId={viewerId}
    postId={post.id}
    initialIsLiked={post.isLikedByViewer}
    initialLikeCount={post.likeCount}
  />
</div>
```

`apps/main/src/app/posts/[id]/page.tsx` passes `viewerId: viewer?.id` to `getThread` and `viewer?.id ?? null` to every `<PostCard>` (root and replies).

### 9. Profile integration

`ProfilePosts` (`apps/main/src/features/profile/components/profile-posts.tsx`) gains a `viewerId: string | null` prop, passes `viewerId ?? undefined` to `getProfilePosts`, and threads `viewerId` through to each `FeedItem`. `ProfileLoadMoreButton` gains the same `viewerId` prop for the items it loads and renders.

`apps/main/src/app/profile/[username]/page.tsx` already resolves `viewer = await usersClient.getViewerUser()` for `follow-system`; pass `viewer?.id ?? null` to `<ProfilePosts viewerId={...} userId={profile.id} />`.

## Risks / Trade-offs

- [Risk] Every post query (feed, thread, profile) now runs an extra `_count` aggregation and a `likes` existence lookup per post → Mitigation: same justification as `replyCount` — a single aggregated query per page load, negligible at page sizes ≤ 20
- [Risk] `getThread` and `getProfilePosts` now take an optional `viewerId` → Mitigation: optional param defaulting via `viewerId ?? ''` in the query, so existing callers without a viewer continue to work and simply get `isLikedByViewer: false`
- [Risk] No `revalidatePath` after a like toggle means the like count shown elsewhere (e.g. the same post in both the feed and an open thread tab) can drift until the next navigation → Mitigation: accepted — both pages are `force-dynamic` and will reflect the new state on next load; the active control itself is always correct via optimistic state
- [Risk] Optimistic local count adjustment (`+1`/`-1`) assumes the action call succeeds → Mitigation: `toggleLikeAction` always returns an explicit result; on error the button reverts both `isLiked` and `likeCount` immediately and surfaces the failure, matching `FollowButton`
- [Risk] `FeedItem` restructuring (pulling `replyCount` out of the body `<Link>`) changes existing markup → Mitigation: both the body and the reply-count link still navigate to the same thread page; only the layout/wrapping changes, not the destination
