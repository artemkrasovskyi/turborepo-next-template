## Context

The domain model (`openspec/specs/domain-model/spec.md`) defines `Notifications`:

> Notifications are informational events shown to a user.
>
> Supported events:
> - New follower
> - New like on own post
>
> Rules:
> - Notifications are informational only.
> - Real-time delivery is not required for MVP.
> - Notifications may be loaded on demand.

Both prior capabilities explicitly deferred this work here:

- `follow-system` (`openspec/specs/follow-system/spec.md`) Non-Goals: "Follow notifications — separate `notifications` capability per the domain model"
- `likes` (`openspec/changes/likes/design.md`) Non-Goals: "Like notifications — separate `notifications` capability per the domain model"

`follow-system` is implemented and archived; `toggleFollowAction` exists at `apps/main/src/features/follow/actions.ts`. The `likes` change is in progress: the `Like` Prisma model, its migration, and `createLikesClient()` (`like()` / `unlike()`) already exist, but `toggleLikeAction` and the UI integration (tasks 8-13 of `likes/tasks.md`) do not yet exist. This design wires FOLLOW notifications fully now, and adds the LIKE-side hook (`notifyLike`) to the notifications client so it is ready to be called from `toggleLikeAction` as soon as `likes` lands.

Existing conventions to follow (`openspec/specs/architecture/spec.md`, and the `feed`/`profile-page`/`follow-system` implementations):

- Feature-first layout under `src/features/<name>/`
- `@repo/api-client` calls Prisma directly via `createXClient()` factories
- Shared types live in `@repo/types/features/<name>`, exported via package.json `exports`
- Cursor pagination (`createdAt desc, id desc`, `take: pageSize + 1`, `cursor`/`skip: 1`), mirroring `getHomeFeed`/`getProfilePosts`
- Server Actions (`'use server'`) wrap api-client mutations
- Client components use `useState` + `useTransition`, mirroring `ProfileLoadMoreButton`'s pending/error pattern
- `viewerId` is resolved via `createUsersClient().getViewerUser()` until `user-auth` lands
- Tailwind styling matching `FeedItem`/`PostCard` (`rounded-lg border border-slate-200 bg-white p-5 shadow-sm`)

## Goals / Non-Goals

**Goals:**

- Add a `Notification` model recording FOLLOW and LIKE events
- Create a FOLLOW notification when a user gains a new follower (first-time follow, not repeat toggles)
- Create a LIKE notification when a user's post receives a like from someone else (first-time like, not repeat toggles, and never for self-likes)
- Display a paginated, reverse-chronological list of the viewer's notifications at `/notifications`
- Let the viewer navigate from a notification to the relevant profile or post
- Link to `/notifications` from the home page

**Non-Goals:**

- Real-time delivery (websockets/polling/push) — explicitly out of scope per domain model
- Read/unread tracking, badges, or counts
- Notification preferences/settings (muting, email digests)
- Notification types beyond FOLLOW and LIKE (e.g. replies, mentions) — not in the domain model
- A shared site-wide navigation component — the notifications link is added directly to the home page header
- Authentication — continues to use `getViewerUser()`

## Requirements

### Requirement: Follow Notifications

The system SHALL create a notification for a user each time a new `Follow` relationship is created with them as the target, and SHALL NOT create duplicate notifications for repeated follow actions that do not create a new relationship.

#### Scenario: Viewer follows a user they don't currently follow

- **WHEN** the viewer follows a user they are not currently following, creating a new `Follow` record
- **THEN** the system SHALL create a notification for that user with type "follow" and the viewer as the actor

#### Scenario: Viewer repeats a follow action that doesn't change the relationship

- **WHEN** the viewer "follows" a user they already follow, and no new `Follow` record is created
- **THEN** the system SHALL NOT create an additional notification

### Requirement: Like Notifications

The system SHALL create a notification for a post's author each time their post receives a like from a different user for the first time, and SHALL NOT create notifications for self-likes or for repeated like actions that do not create a new like.

#### Scenario: Viewer likes another user's post for the first time

- **WHEN** the viewer likes a post authored by a different user, creating a new `Like` record
- **THEN** the system SHALL create a notification for the post's author with type "like", the viewer as the actor, and a reference to that post

#### Scenario: Viewer likes their own post

- **WHEN** the viewer likes a post they authored themselves
- **THEN** the system SHALL NOT create a notification

#### Scenario: Viewer repeats a like action that doesn't change the relationship

- **WHEN** the viewer likes a post they already liked, and no new `Like` record is created
- **THEN** the system SHALL NOT create an additional notification

### Requirement: Notifications List

The system SHALL display a paginated, reverse-chronological list of the viewer's notifications.

#### Scenario: Viewer has notifications

- **WHEN** the viewer opens `/notifications` and has notification records
- **THEN** the system SHALL display them ordered by `createdAt` descending, each showing the actor and the type of event

#### Scenario: Viewer has no notifications

- **WHEN** the viewer opens `/notifications` and has no notification records
- **THEN** the system SHALL display an empty state indicating there are no notifications yet

#### Scenario: Loading more notifications

- **WHEN** more notifications exist beyond the initial page
- **THEN** the system SHALL let the viewer load additional notifications via a "load more" control, and SHALL indicate when no further notifications remain

### Requirement: Notification Navigation

The system SHALL let the viewer navigate from a notification to the profile or post it relates to.

#### Scenario: Follow notification

- **WHEN** a "follow" notification is displayed
- **THEN** it SHALL show the follower's identity and link to that follower's profile page

#### Scenario: Like notification

- **WHEN** a "like" notification is displayed
- **THEN** it SHALL show the liker's identity and a reference to the liked post, and link to that post's thread page

## Decisions

### 1. Schema — add a `Notification` model and `NotificationType` enum

```prisma
enum NotificationType {
  FOLLOW
  LIKE
}

model Notification {
  id          String           @id @default(cuid())
  recipientId String
  actorId     String
  type        NotificationType
  postId      String?
  createdAt   DateTime         @default(now())

  recipient User  @relation("NotificationRecipient", fields: [recipientId], references: [id])
  actor     User  @relation("NotificationActor", fields: [actorId], references: [id])
  post      Post? @relation(fields: [postId], references: [id])

  @@index([recipientId, createdAt])
}
```

Add the back-relations:

```prisma
model User {
  // ...existing fields...
  notificationsReceived Notification[] @relation("NotificationRecipient")
  notificationsSent     Notification[] @relation("NotificationActor")
}

model Post {
  // ...existing fields...
  notifications Notification[]
}
```

`postId` is nullable since FOLLOW notifications have no related post; LIKE notifications set it to the liked post's id. `@@index([recipientId, createdAt])` supports the per-viewer cursor-paginated query, mirroring `Post`'s `@@index([authorId, createdAt])`. Run `bun run db:migrate --name add_notification_model`.

### 2. Shared types — `packages-types/src/features/notifications/index.ts`

```ts
export type NotificationType = 'FOLLOW' | 'LIKE';

export type NotificationActor = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  actor: NotificationActor;
  createdAt: string;
  post: { id: string; body: string } | null;
};

export type NotificationPage = {
  items: NotificationItem[];
  nextCursor: string | null;
};
```

`post` is `null` for FOLLOW notifications and populated for LIKE notifications. Add `"./features/notifications": "./src/features/notifications/index.ts"` to `packages-types/package.json` exports.

### 3. Notifications client — `packages/api-client/src/features/notifications/index.ts`

```ts
import { prisma } from '@repo/shared/features/database';
import type { NotificationPage } from '@repo/types/features/notifications';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 20;

const ACTOR_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

export function createNotificationsClient() {
  return {
    async notifyFollow({
      recipientId,
      actorId,
    }: { recipientId: string; actorId: string }): Promise<void> {
      await prisma.notification.create({
        data: { recipientId, actorId, type: 'FOLLOW' },
      });
    },

    async notifyLike({
      actorId,
      postId,
    }: { actorId: string; postId: string }): Promise<void> {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });

      if (!post || post.authorId === actorId) {
        return;
      }

      await prisma.notification.create({
        data: { recipientId: post.authorId, actorId, type: 'LIKE', postId },
      });
    },

    async getNotifications({
      userId,
      cursor,
      limit,
    }: { userId: string; cursor?: string; limit?: number }): Promise<NotificationPage> {
      const pageSize = Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

      const notifications = await prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: pageSize + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          actor: { select: ACTOR_SELECT },
          post: { select: { id: true, body: true } },
        },
      });

      const hasMore = notifications.length > pageSize;
      const pageItems = hasMore ? notifications.slice(0, pageSize) : notifications;

      return {
        items: pageItems.map((notification) => ({
          id: notification.id,
          type: notification.type,
          actor: notification.actor,
          createdAt: notification.createdAt.toISOString(),
          post: notification.post,
        })),
        nextCursor: hasMore ? (pageItems[pageItems.length - 1]?.id ?? null) : null,
      };
    },
  };
}
```

`notifyLike` resolves the recipient itself from the post's `authorId` and silently no-ops on self-likes, so callers only need `actorId` and `postId`. Add `"./features/notifications": "./src/features/notifications/index.ts"` to `packages/api-client/package.json` exports.

### 4. Detect newly-created `Follow` / `Like` records

`createFollowClient().follow()` (`packages/api-client/src/features/follow/index.ts`) and `createLikesClient().like()` (`packages/api-client/src/features/likes/index.ts`) currently use `upsert`, which doesn't report whether a row already existed. Both change to an existence check + `create`, returning `{ created: boolean }`:

```ts
async follow({ followerId, followingId }: FollowParams): Promise<{ created: boolean }> {
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    return { created: false };
  }

  await prisma.follow.create({ data: { followerId, followingId } });
  return { created: true };
}
```

```ts
async like({ userId, postId }: LikeParams): Promise<{ created: boolean }> {
  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    return { created: false };
  }

  await prisma.like.create({ data: { userId, postId } });
  return { created: true };
}
```

`unfollow()` / `unlike()` are unchanged — no notification is created on unfollow or unlike. The extra existence-check query is negligible at this scale and both operations remain idempotent.

### 5. Wire FOLLOW notifications into `toggleFollowAction`

`apps/main/src/features/follow/actions.ts`:

```ts
const followClient = createFollowClient();
const notificationsClient = createNotificationsClient();

export async function toggleFollowAction(
  followerId: string,
  followingId: string,
  nextIsFollowing: boolean,
): Promise<ToggleFollowResult> {
  if (followerId === followingId) {
    return { error: 'You cannot follow yourself.' };
  }

  if (nextIsFollowing) {
    const { created } = await followClient.follow({ followerId, followingId });
    if (created) {
      await notificationsClient.notifyFollow({ recipientId: followingId, actorId: followerId });
    }
  } else {
    await followClient.unfollow({ followerId, followingId });
  }

  revalidatePath('/profile/[username]', 'page');
  return { isFollowing: nextIsFollowing };
}
```

### 6. Wire LIKE notifications into `toggleLikeAction`

`apps/main/src/features/likes/actions.ts` (introduced by the `likes` change):

```ts
if (nextIsLiked) {
  const { created } = await likesClient.like({ userId, postId });
  if (created) {
    await notificationsClient.notifyLike({ actorId: userId, postId });
  }
} else {
  await likesClient.unlike({ userId, postId });
}
```

If `likes` has not yet landed when this task is picked up, create `toggleLikeAction` per the `likes` design first (or land `likes` before this piece), then add this `notifyLike` call.

### 7. Notifications page — `apps/main/src/app/notifications/page.tsx`

`force-dynamic`, resolves the viewer via `getViewerUser()`. If no viewer is resolved, render the same "No users yet" guidance as the home page. Otherwise fetch the first page via `getNotifications({ userId: viewer.id })`, render an empty state when there are no items and no further cursor, otherwise render each via `NotificationItem`, followed by `NotificationLoadMoreButton`.

### 8. `NotificationItem` — `apps/main/src/features/notifications/components/notification-item.tsx`

Server component, styled like `FeedItem`/`PostCard` (`rounded-lg border border-slate-200 bg-white p-5 shadow-sm`), with the same `getInitials` avatar treatment. Renders based on `type`:

- `FOLLOW`: avatar + "**{actor.displayName}** (@{actor.username}) started following you" · relative time, wrapped in `<Link href="/profile/{actor.username}">`
- `LIKE`: avatar + "**{actor.displayName}** (@{actor.username}) liked your post" · relative time, with a truncated snippet of `post.body`, wrapped in `<Link href="/posts/{post.id}">`

Reuses `formatRelativeTime` (currently duplicated in `feed/lib` and `post-thread/lib`).

### 9. `loadMoreNotificationsAction` + `NotificationLoadMoreButton`

`apps/main/src/features/notifications/actions.ts`:

```ts
'use server';

export async function loadMoreNotificationsAction(
  userId: string,
  cursor: string,
): Promise<NotificationPage> {
  return notificationsClient.getNotifications({ userId, cursor });
}
```

`apps/main/src/features/notifications/components/notification-load-more-button.tsx` mirrors `ProfileLoadMoreButton`: `useState` + `useTransition`, appends loaded items, hides itself once `cursor === null` and no items are pending.

### 10. Home page link

Add a "Notifications" link to the header in `apps/main/src/app/page.tsx`, pointing to `/notifications`, styled consistently with the existing header text (e.g. `text-sm font-semibold text-teal-700 hover:underline`). No shared nav component is introduced.

## Risks / Trade-offs

- [Risk] Changing `follow()` / `like()` from `upsert` to existence-check + `create` adds one extra query per toggle → Mitigation: negligible at this scale; required to detect "newly created" for notification dedup, and both operations remain idempotent
- [Risk] LIKE notification wiring depends on the in-progress `likes` change for `toggleLikeAction` to exist → Mitigation: `notifyLike` is added to the notifications client regardless, ready to be called once `toggleLikeAction` exists; if `likes` lands first, wiring it in is a one-line addition to that action
- [Risk] No read/unread tracking means the list always shows the full history from the most recent item → Mitigation: explicitly out of scope per domain model ("informational only"); acceptable for MVP
- [Risk] `getNotifications` performs a per-page `include` for `actor` and `post` → Mitigation: same pattern as `getHomeFeed`/`getThread`, negligible at page sizes ≤ 20
