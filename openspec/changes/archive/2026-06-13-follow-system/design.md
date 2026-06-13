## Context

The `profile-page` capability renders a user's avatar, bio, posts, and follower/following counts at `/profile/[username]`, but explicitly lists as a Non-Goal:

> Follow / unfollow button and mutation — separate `follow` capability, not built here

The domain model (`openspec/specs/domain-model/spec.md`) already defines the rules this capability must enforce:

> A user cannot follow themselves. A follow relationship must be unique. Following a user allows their posts to appear in the follower's feed.

The `feed` capability already queries the `Follow` table to compose the home feed, and the `Follow` Prisma model already exists with a composite primary key:

```prisma
model Follow {
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("Follower", fields: [followerId], references: [id])
  following User @relation("Following", fields: [followingId], references: [id])

  @@id([followerId, followingId])
}
```

This design adds the follow/unfollow mutation and button to the profile page, closing the gap left open by `profile-page`.

Existing conventions to follow (`openspec/specs/architecture/spec.md`, and the `feed`/`post-composer`/`profile-page` implementations):

- Feature-first layout under `src/features/<name>/`
- `@repo/api-client` calls Prisma directly via `createXClient()` factories
- Shared types live in `@repo/types/features/<name>`, exported via package.json `exports`
- Server Actions (`'use server'`) wrap api-client mutations and call `revalidatePath(...)`
- Client components use `useState` + `useTransition`, mirroring `LoadMoreButton`'s pending/error pattern
- `viewerId` is resolved via `createUsersClient().getViewerUser()` until `user-auth` lands
- Tailwind styling matching `ProfileHeader` (`rounded-lg border border-slate-200 bg-white p-5 shadow-sm`, teal accent)

## Goals / Non-Goals

**Goals:**

- Let the viewer follow and unfollow another user from that user's profile page
- Prevent a user from following themselves
- Make follow/unfollow idempotent (no error when following someone already followed, or unfollowing someone not followed)
- Show the viewer's current relationship to the profile owner ("Follow" / "Following") and let them toggle it
- Keep follower/following counts on profile pages accurate after a follow or unfollow

**Non-Goals:**

- Followers / following list pages (viewing who follows or is followed by a user) — future capability
- Follow notifications — separate `notifications` capability per the domain model
- Suggested or recommended users to follow
- A follow control anywhere other than the profile page (e.g. inline in the feed)
- Authentication — continues to use `getViewerUser()`

## Requirements

### Requirement: Follow Relationship Management

The system SHALL let a viewer follow and unfollow another user, and SHALL prevent a user from following themselves.

#### Scenario: Viewer follows a user they don't already follow

- **WHEN** the viewer follows a user they do not currently follow
- **THEN** the system SHALL create a `Follow` record with `followerId` set to the viewer and `followingId` set to the target user

#### Scenario: Viewer unfollows a user they follow

- **WHEN** the viewer unfollows a user they currently follow
- **THEN** the system SHALL remove the corresponding `Follow` record

#### Scenario: Viewer attempts to follow themselves

- **WHEN** the viewer attempts to follow their own account
- **THEN** the system SHALL NOT create a `Follow` record and SHALL indicate that following yourself is not allowed

#### Scenario: Viewer follows a user they already follow

- **WHEN** the viewer follows a user they already follow
- **THEN** the system SHALL NOT create a duplicate `Follow` record and SHALL NOT return an error

### Requirement: Follow Button Reflects Relationship State

The system SHALL display a follow control on a user's profile reflecting the viewer's current relationship to that user, except on the viewer's own profile.

#### Scenario: Viewer does not follow the profile owner

- **WHEN** the viewer opens a profile for a user they do not follow
- **THEN** the system SHALL display a "Follow" control

#### Scenario: Viewer follows the profile owner

- **WHEN** the viewer opens a profile for a user they follow
- **THEN** the system SHALL display a "Following" control that allows unfollowing

#### Scenario: Viewer opens their own profile

- **WHEN** the viewer opens their own profile
- **THEN** the system SHALL NOT display a follow control

#### Scenario: Viewer toggles the follow control

- **WHEN** the viewer activates the follow control
- **THEN** the system SHALL update the control to reflect the new relationship state without a full page reload

#### Scenario: Toggling fails

- **WHEN** a follow or unfollow action fails
- **THEN** the system SHALL revert the control to its previous state and display an inline error message

### Requirement: Follower and Following Counts Stay Accurate

The system SHALL ensure a profile's follower and following counts reflect the current set of `Follow` relationships after a follow or unfollow action.

#### Scenario: Counts update after following

- **WHEN** the viewer follows a user
- **THEN** that user's follower count SHALL increase by one and the viewer's following count SHALL increase by one on next render

#### Scenario: Counts update after unfollowing

- **WHEN** the viewer unfollows a user
- **THEN** that user's follower count SHALL decrease by one and the viewer's following count SHALL decrease by one on next render

## Decisions

### 1. No schema changes

The existing `Follow` model with composite `@@id([followerId, followingId])` already enforces relationship uniqueness at the database level. No migration is needed. Self-follow prevention is an application-level rule (Prisma has no declarative `CHECK` constraint), enforced in the server action and reinforced by the UI not rendering a follow control on the viewer's own profile.

### 2. Shared types — `packages-types/src/features/follow/index.ts`

```ts
export type ToggleFollowResult =
  | { isFollowing: boolean; error?: undefined }
  | { isFollowing?: undefined; error: string };
```

Add `"./features/follow": "./src/features/follow/index.ts"` to `packages-types/package.json` exports.

### 3. Follow client — `packages/api-client/src/features/follow/index.ts`

```ts
import { prisma } from '@repo/shared/features/database';

type FollowParams = {
  followerId: string;
  followingId: string;
};

export function createFollowClient() {
  return {
    async follow({ followerId, followingId }: FollowParams): Promise<void> {
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId, followingId } },
        create: { followerId, followingId },
        update: {},
      });
    },

    async unfollow({ followerId, followingId }: FollowParams): Promise<void> {
      await prisma.follow.deleteMany({
        where: { followerId, followingId },
      });
    },
  };
}
```

`upsert` makes `follow` idempotent (no `P2002` unique-constraint error if the relationship already exists); `deleteMany` makes `unfollow` idempotent (no "record not found" error if it doesn't). Add `"./features/follow": "./src/features/follow/index.ts"` to `packages/api-client/package.json` exports.

### 4. Extend `ProfileUser` and `getProfileByUsername` with `isFollowing`

`packages-types/src/features/profile/index.ts` gains one field:

```ts
export type ProfileUser = {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
};
```

`getProfileByUsername` in `packages/api-client/src/features/profile/index.ts` takes an optional `viewerId` and checks for a `Follow` record from the viewer to the profile owner:

```ts
async getProfileByUsername(username: string, viewerId?: string): Promise<ProfileUser | null> {
  const user = await prisma.user.findUnique({ /* ...unchanged select... */ });

  if (!user) {
    return null;
  }

  const isFollowing =
    viewerId !== undefined
      ? (await prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
        })) !== null
      : false;

  return {
    /* ...unchanged fields... */
    isFollowing,
  };
}
```

`viewerId` is optional and defaults `isFollowing` to `false` so the signature stays backward compatible if `getProfileByUsername` is ever called without a viewer.

### 5. Server action — `apps/main/src/features/follow/actions.ts`

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { createFollowClient } from '@repo/api-client/features/follow';
import type { ToggleFollowResult } from '@repo/types/features/follow';

const followClient = createFollowClient();

export async function toggleFollowAction(
  followerId: string,
  followingId: string,
  nextIsFollowing: boolean,
): Promise<ToggleFollowResult> {
  if (followerId === followingId) {
    return { error: 'You cannot follow yourself.' };
  }

  if (nextIsFollowing) {
    await followClient.follow({ followerId, followingId });
  } else {
    await followClient.unfollow({ followerId, followingId });
  }

  revalidatePath('/profile/[username]', 'page');
  return { isFollowing: nextIsFollowing };
}
```

`revalidatePath('/profile/[username]', 'page')` revalidates the profile route template for every username, so both the target's follower count and the viewer's own following count refresh, regardless of which profile is currently open.

### 6. `FollowButton` — `apps/main/src/features/follow/components/follow-button.tsx`

Client component (`'use client'`), `useState` + `useTransition`, mirroring `LoadMoreButton`'s pending/error pattern:

- Renders `null` when `viewerId === targetUserId` (viewer's own profile)
- Optimistically flips local `isFollowing` state on click, then calls `toggleFollowAction`
- On error, reverts the local state and shows an inline `text-red-600` message
- Styling: "Follow" uses the teal filled style (`bg-teal-600 text-white`), "Following" uses the outlined style (`border border-slate-200 text-slate-700`), matching `PostComposer`'s submit button and `ProfileLoadMoreButton` respectively

### 7. Profile integration

- `apps/main/src/app/profile/[username]/page.tsx` resolves the viewer via `createUsersClient().getViewerUser()` and passes `viewer?.id` to `getProfileByUsername(username, viewer?.id)` and through to `ProfileHeader`
- `ProfileHeader` (`apps/main/src/features/profile/components/profile-header.tsx`) accepts a `viewerId: string | null` prop and renders `<FollowButton viewerId={viewerId} targetUserId={profile.id} initialIsFollowing={profile.isFollowing} />` next to the follower/following counts when `viewerId` is non-null

## Risks / Trade-offs

- [Risk] Self-follow is validated only in the server action, not by a database constraint → Mitigation: Prisma has no declarative `CHECK` constraint mechanism; the `FollowButton` also never renders on the viewer's own profile (defense in depth)
- [Risk] `revalidatePath('/profile/[username]', 'page')` revalidates every profile page on each toggle → Mitigation: profile pages are already `force-dynamic`; this is the simplest way to keep both sides of the relationship's counts in sync without threading both usernames through the action
- [Risk] Optimistic UI toggle can briefly show a state that doesn't match the server until the action resolves → Mitigation: `toggleFollowAction` always returns an explicit result; on error the button reverts immediately and surfaces the failure
- [Risk] `getProfileByUsername` now depends on a `viewerId` to compute `isFollowing` → Mitigation: `viewerId` is optional and `isFollowing` defaults to `false`, so existing callers without a viewer continue to work
