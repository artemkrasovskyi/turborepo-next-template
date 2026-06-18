## Context

The `follow-system` capability (archived `2026-06-13-follow-system`) delivered follow/unfollow
mutations, the `FollowButton` on profile pages, and accurate follower/following counts in
`ProfileHeader`. It explicitly deferred:

> Followers / following list pages (viewing who follows or is followed by a user) — future capability

The `ProfileHeader` currently renders `followerCount` and `followingCount` as plain `<span>`
elements. Clicking them does nothing. This design adds the two missing pages and wires the counts
to them, completing Phase 4 of the follow system.

Existing conventions to follow (`openspec/specs/architecture/spec.md`, and the `follow-system` /
`profile-page` implementations):

- Feature-first layout under `src/features/<name>/`
- `@repo/api-client` calls Prisma directly via `createXClient()` factories
- Shared types live in `@repo/types/features/<name>`, exported via `package.json` `exports`
- Server Actions (`'use server'`) wrap api-client reads for load-more pagination
- Client components use `useState` + `useTransition` for load-more, mirroring `LoadMoreButton`
- `viewerId` is resolved via `createUsersClient().getViewerUser()`
- Tailwind styling matches existing profile and notification patterns

## Goals / Non-Goals

**Goals:**

- `/profile/[username]/followers` — paginated list of users who follow this user, each with a
  follow button
- `/profile/[username]/following` — paginated list of users this user follows, each with a
  follow button
- `ProfileHeader` follower and following counts become links to the respective pages
- Viewer can follow/unfollow users directly from both list pages (reusing `FollowButton`)
- Consistent empty states and loading skeletons for both routes

**Non-Goals:**

- Mutual-follow detection ("Follows you back")
- Search or filtering within the list
- Sorting options (always ordered newest-follow-first)
- Authentication — continues to use `getViewerUser()`

## Requirements

### Requirement: Followers List Page

The system SHALL provide a paginated page at `/profile/[username]/followers` listing all users
who follow the given profile.

#### Scenario: Profile has followers

- **WHEN** a viewer navigates to `/profile/[username]/followers`
- **THEN** the system SHALL display a list of users who follow `username`, ordered
  newest-follow-first, 20 per page, with a "Load more" control if more exist

#### Scenario: Profile has no followers

- **WHEN** a viewer navigates to `/profile/[username]/followers` and the user has no followers
- **THEN** the system SHALL display an empty state indicating no followers yet

#### Scenario: Profile username does not exist

- **WHEN** a viewer navigates to `/profile/[username]/followers` for a non-existent user
- **THEN** the system SHALL display a not-found empty state

### Requirement: Following List Page

The system SHALL provide a paginated page at `/profile/[username]/following` listing all users
that the given profile follows.

#### Scenario: User follows others

- **WHEN** a viewer navigates to `/profile/[username]/following`
- **THEN** the system SHALL display a list of users that `username` follows, ordered
  newest-follow-first, 20 per page, with a "Load more" control if more exist

#### Scenario: User follows nobody

- **WHEN** a viewer navigates to `/profile/[username]/following` and the user follows no one
- **THEN** the system SHALL display an empty state indicating they are not following anyone yet

#### Scenario: Profile username does not exist

- **WHEN** a viewer navigates to `/profile/[username]/following` for a non-existent user
- **THEN** the system SHALL display a not-found empty state

### Requirement: Follow Control on List Items

Each user card on both pages SHALL include a follow button, consistent with the button on the
profile page.

#### Scenario: Viewer is not following a listed user

- **WHEN** the viewer views a user card where they do not follow that user
- **THEN** the system SHALL display a "Follow" control

#### Scenario: Viewer is following a listed user

- **WHEN** the viewer views a user card where they already follow that user
- **THEN** the system SHALL display a "Following" control

#### Scenario: Viewer's own card appears in the list

- **WHEN** the viewer's own account appears in the followers or following list
- **THEN** the system SHALL NOT display a follow control on that card

### Requirement: ProfileHeader Count Links

The system SHALL make `followerCount` and `followingCount` in `ProfileHeader` navigable links to
the respective list pages.

#### Scenario: Viewer clicks the follower count

- **WHEN** the viewer clicks the follower count on a profile
- **THEN** the system SHALL navigate to `/profile/[username]/followers`

#### Scenario: Viewer clicks the following count

- **WHEN** the viewer clicks the following count on a profile
- **THEN** the system SHALL navigate to `/profile/[username]/following`

## Decisions

### 1. New shared types — `packages-types/src/features/follow/index.ts`

Append to the existing file (keeping `ToggleFollowResult`):

```ts
export type FollowListUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isFollowing: boolean;
};

export type FollowListPage = {
  items: FollowListUser[];
  nextCursor: string | null;
};
```

No new `package.json` export entry needed — `"./features/follow"` already exists.

### 2. New api-client methods — `packages/api-client/src/features/follow/index.ts`

Add `getFollowers` and `getFollowing` to the existing `createFollowClient()` factory.

```ts
type FollowListParams = {
  userId: string;
  viewerId?: string;
  cursor?: string;
  limit?: number;
};
```

**`getFollowers({ userId, viewerId, cursor, limit })`** — paginates the `Follow` table where
`followingId = userId`. The composite PK is `(followerId, followingId)`, so with `followingId`
fixed the cursor is the `followerId` of the last item:

```ts
const follows = await prisma.follow.findMany({
  where: { followingId: userId },
  orderBy: [{ createdAt: 'desc' }, { followerId: 'desc' }],
  take: pageSize + 1,
  ...(cursor
    ? { cursor: { followerId_followingId: { followerId: cursor, followingId: userId } }, skip: 1 }
    : {}),
  select: { follower: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
});
```

**`getFollowing({ userId, viewerId, cursor, limit })`** — paginates where `followerId = userId`.
With `followerId` fixed the cursor is the `followingId` of the last item:

```ts
const follows = await prisma.follow.findMany({
  where: { followerId: userId },
  orderBy: [{ createdAt: 'desc' }, { followingId: 'desc' }],
  take: pageSize + 1,
  ...(cursor
    ? { cursor: { followerId_followingId: { followerId: userId, followingId: cursor } }, skip: 1 }
    : {}),
  select: { following: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
});
```

**Batch `isFollowing` check** — after fetching the page, one query resolves which listed users
the viewer follows (avoids N+1):

```ts
const ids = users.map((u) => u.id);
const viewerFollowSet = viewerId
  ? new Set(
      (
        await prisma.follow.findMany({
          where: { followerId: viewerId, followingId: { in: ids } },
          select: { followingId: true },
        })
      ).map((f) => f.followingId),
    )
  : new Set<string>();

return {
  items: users.map((u) => ({ ...u, isFollowing: viewerFollowSet.has(u.id) })),
  nextCursor: hasMore ? (users[users.length - 1]?.id ?? null) : null,
};
```

No new `package.json` export entry needed — `"./features/follow"` already exists.

### 3. Server actions — `apps/main/src/features/follow/actions.ts`

Append two load-more actions to the existing file:

```ts
export async function loadMoreFollowersAction(
  userId: string,
  cursor: string,
  viewerId?: string,
): Promise<FollowListPage> {
  return followClient.getFollowers({ userId, viewerId, cursor });
}

export async function loadMoreFollowingAction(
  userId: string,
  cursor: string,
  viewerId?: string,
): Promise<FollowListPage> {
  return followClient.getFollowing({ userId, viewerId, cursor });
}
```

`followClient` is already instantiated at the top of the file.

### 4. New components — `apps/main/src/features/follow/components/`

**`follow-user-card.tsx`** — server component. Compact profile card: avatar-initials circle,
display name + `@username` link, `FollowButton` (hidden when `viewerId === user.id`). Matching
teal/slate styling from `ProfileHeader` and `NotificationItem`.

```tsx
import Link from 'next/link';
import type { FollowListUser } from '@repo/types/features/follow';
import { FollowButton } from './follow-button';

type FollowUserCardProps = {
  user: FollowListUser;
  viewerId: string | null;
};

export function FollowUserCard({ user, viewerId }: FollowUserCardProps) { ... }
```

**`followers-list.tsx`** — client component (`'use client'`). Accepts initial `FollowListPage`,
`userId`, and `viewerId`. Renders `FollowUserCard` per item; "Load more" button calls
`loadMoreFollowersAction` via `useTransition`, appending results. Same pending/error pattern as
`LoadMoreButton`.

**`following-list.tsx`** — identical shape, calls `loadMoreFollowingAction`.

### 5. New routes

**`apps/main/src/app/profile/[username]/followers/page.tsx`** — async server component:
1. Resolves `viewer` via `usersClient.getViewerUser()`
2. Resolves `profile` via `profileClient.getProfileByUsername(username, viewer?.id)`
3. If no profile → `EmptyState` ("Profile not found")
4. Fetches initial followers page via `followClient.getFollowers({ userId: profile.id, viewerId: viewer?.id })`
5. Renders page header ("Followers · @username" or similar), back-link to `/profile/[username]`,
   and `<FollowersList>` with initial data

**`apps/main/src/app/profile/[username]/following/page.tsx`** — same pattern with `getFollowing`
and `<FollowingList>`.

Both pages: `export const dynamic = 'force-dynamic'`, same `<main>` container as profile page
(`mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl`).

**`apps/main/src/app/profile/[username]/followers/loading.tsx`** and
**`apps/main/src/app/profile/[username]/following/loading.tsx`** — header `SkeletonLine` + 4×
`SkeletonNotificationRow` (same visual weight as the user cards).

### 6. ProfileHeader links

In `apps/main/src/features/profile/components/profile-header.tsx`, convert the two stat `<span>`s
to `<Link>` elements:

```tsx
import Link from 'next/link';

// from:
<span>
  <span className="font-semibold text-slate-950">{profile.followingCount}</span> Following
</span>
<span>
  <span className="font-semibold text-slate-950">{profile.followerCount}</span> Followers
</span>

// to:
<Link href={`/profile/${profile.username}/following`} className="focus-ring rounded hover:underline">
  <span className="font-semibold text-slate-950">{profile.followingCount}</span> Following
</Link>
<Link href={`/profile/${profile.username}/followers`} className="focus-ring rounded hover:underline">
  <span className="font-semibold text-slate-950">{profile.followerCount}</span> Followers
</Link>
```

`focus-ring` is already defined in `globals.css`.

## Risks / Trade-offs

- [Risk] Batch `isFollowing` query uses `IN (ids)` — for a 20-item page this is at most 20 IDs,
  well within Postgres limits; no concern at current scale
- [Risk] Cursor ordering by `(createdAt desc, followerId/followingId desc)` is stable but relies
  on no two follow records having the exact same `createdAt` — the composite PK tiebreaker
  (`followerId/followingId`) makes pagination deterministic even if timestamps collide
- [Risk] `loadMoreFollowersAction` and `loadMoreFollowingAction` do not revalidate any path — the
  list is append-only on the client, which can go stale if another user follows/unfollows between
  paginations; acceptable at this scale
- [Risk] `ProfileHeader` links expose followers/following pages before those routes exist — mitigated
  by implementing both in the same pass
