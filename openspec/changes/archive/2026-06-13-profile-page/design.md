## Context

The `feed` capability renders posts from followed users and the viewer on the home page (`apps/main/src/app/page.tsx`), but there is no way to view a single user in isolation. The domain model (`openspec/specs/domain-model/spec.md`) defines a `Profile` entity:

> A profile represents the public view of a user. A profile displays user information, the user's posts, and follower/following counts. Profile visibility is public in MVP.

This design adds that public profile page to `apps/main`, and links feed post authors to it.

Existing conventions to follow (`openspec/specs/architecture/spec.md`, and the `feed`/`post-composer` implementations):

- Feature-first layout under `src/features/<name>/`
- `@repo/api-client` calls Prisma directly via `createXClient()` factories (see `createFeedClient`, `createUsersClient`)
- Shared types live in `@repo/types/features/<name>`, exported via package.json `exports`
- Keyset (cursor) pagination for post lists, mirroring `createFeedClient().getHomeFeed()`
- Server components fetch data directly; client components use `useTransition` + a `'use server'` action for "load more" (see `LoadMoreButton`)
- Tailwind styling matching `FeedItem` (`rounded-lg border border-slate-200 bg-white p-5 shadow-sm`, teal initials avatar)

## Goals / Non-Goals

**Goals:**

- Public profile page at `/profile/[username]` showing avatar (initials), display name, `@username`, bio, and join date
- Display follower count and following count
- Display the profile owner's top-level posts in reverse-chronological order, paginated via "load more"
- Show a friendly "not found" state for a username that doesn't exist
- Link feed post authors (avatar and name) to their profile page

**Non-Goals:**

- Follow / unfollow button and mutation — separate `follow` capability, not built here
- Editing the viewer's own profile (bio, avatar, display name)
- Replies or thread view on the profile — only top-level posts, same exclusion rule as the home feed
- Tabs (Posts / Replies / Likes / Media)
- Authentication-gated visibility — profiles remain public per the domain model; `viewerId` is not required by this page

## Requirements

### Requirement: Profile Information Display

The system SHALL display a public profile page showing the user's avatar, display name, username, and bio.

#### Scenario: Viewing an existing user's profile

- **WHEN** a viewer navigates to `/profile/<username>` for a username that exists
- **THEN** the system SHALL display that user's avatar (initials), display name, `@username`, and bio

#### Scenario: Profile with no bio

- **WHEN** the profile owner has no `bio`
- **THEN** the system SHALL render the profile without a bio section, rather than showing an empty or placeholder line

### Requirement: Profile Social Counts

The system SHALL display the number of users the profile owner follows and the number of users following them.

#### Scenario: Profile with followers and follows

- **WHEN** a viewer opens a profile
- **THEN** the system SHALL display the follower count and following count

#### Scenario: Profile with zero followers or follows

- **WHEN** the profile owner has zero followers or follows zero users
- **THEN** the system SHALL display `0`, not hide the count

### Requirement: Profile Posts

The system SHALL display the profile owner's top-level posts in reverse-chronological order, paginated. Replies SHALL NOT appear on the profile, consistent with the home feed.

#### Scenario: Profile owner has posts

- **WHEN** a viewer opens a profile for a user with top-level posts
- **THEN** the system SHALL display those posts ordered by `createdAt` descending

#### Scenario: Profile owner has no posts

- **WHEN** a viewer opens a profile for a user with no top-level posts
- **THEN** the system SHALL display an empty state indicating the user hasn't posted yet

#### Scenario: Loading more posts

- **WHEN** more posts exist beyond the initial page
- **THEN** the system SHALL let the viewer load additional posts via a "load more" control, and SHALL indicate when no further posts remain

### Requirement: Profile Not Found

The system SHALL handle a profile request for a username that does not exist without erroring.

#### Scenario: Unknown username

- **WHEN** a viewer navigates to `/profile/<username>` for a username with no matching user
- **THEN** the system SHALL display a "profile not found" message instead of post content

### Requirement: Navigation to Profiles

The system SHALL let viewers navigate from a post's author in the home feed to that author's profile page.

#### Scenario: Viewer clicks a feed post's author

- **WHEN** a viewer clicks a post author's avatar or name in the home feed
- **THEN** the system SHALL navigate to `/profile/<author's username>`

## Decisions

### 1. Route — `apps/main/src/app/profile/[username]/page.tsx`

Dynamic route keyed by `username` (the unique, public identifier per the domain model), not `id`. `export const dynamic = 'force-dynamic'`, matching `app/page.tsx`.

### 2. Shared types — `packages-types/src/features/profile/index.ts`

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
};
```

Posts reuse the existing `FeedPost` / `FeedPage` types from `@repo/types/features/feed` — a profile post has the same shape (`id`, `body`, `createdAt`, `author`) as a feed post. Add `"./features/profile": "./src/features/profile/index.ts"` to `packages-types/package.json` exports.

### 3. Profile client — `packages/api-client/src/features/profile/index.ts`

```ts
export function createProfileClient() {
  return {
    async getProfileByUsername(username: string): Promise<ProfileUser | null> {
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { followers: true, following: true } },
        },
      });

      if (!user) return null;

      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        followerCount: user._count.followers,
        followingCount: user._count.following,
      };
    },

    async getProfilePosts({ userId, cursor, limit }: GetProfilePostsParams): Promise<FeedPage> {
      // same keyset-pagination query as createFeedClient().getHomeFeed(),
      // but `where: { parentId: null, authorId: userId }` — no follow-list union
    },
  };
}
```

Add `"./features/profile": "./src/features/profile/index.ts"` to `packages/api-client/package.json` exports.

### 4. UI composition (`apps/main`)

- `src/features/profile/components/profile-header.tsx` — server component; renders the teal initials avatar (same `getInitials` treatment as `FeedItem`, duplicated rather than extracted — it's a 6-line pure function and the two call sites are unlikely to diverge but also small enough that a shared util isn't worth it yet), display name, `@username`, bio (if present), join date (`new Date(profile.createdAt)` formatted via `Intl.DateTimeFormat`), and follower/following counts
- `src/features/profile/components/profile-posts.tsx` — server component, analogous to `FeedList`: calls `getProfilePosts({ userId })` for the first page, renders `FeedItem` (reused from `feed`) per post, an empty state ("No posts yet"), and `ProfileLoadMoreButton`
- `src/features/profile/components/profile-load-more-button.tsx` — client component, analogous to `LoadMoreButton`, calling `loadMoreProfilePostsAction`
- `src/features/profile/actions.ts` — `'use server'` action wrapping `createProfileClient().getProfilePosts()`
- `src/app/profile/[username]/page.tsx` — calls `getProfileByUsername(params.username)`; if `null`, renders an inline "Profile not found" state (same dashed-border empty-state pattern as `app/page.tsx`'s "No users yet"); otherwise renders `ProfileHeader` + `ProfilePosts`

### 5. Feed → profile navigation

Wrap the avatar and name/username block in `FeedItem` (`apps/main/src/features/feed/components/feed-item.tsx`) with a Next.js `<Link href={`/profile/${post.author.username}`}>`.

## Risks / Trade-offs

- [Risk] `_count` aggregation on `User` for follower/following counts adds a join → Mitigation: a single Prisma call for one profile, negligible at this scale
- [Risk] Reusing `FeedPost`/`FeedItem` couples profile posts to feed types/UI → Mitigation: shapes are already identical; if profile posts diverge (e.g. pinned posts), split then
- [Risk] No `not-found.tsx` route file — "not found" is rendered inline rather than via `notFound()` → Mitigation: consistent with the existing inline empty-state pattern in `app/page.tsx`; avoids an extra file for a single message
- [Risk] Visiting your own profile looks identical to visiting anyone else's (no edit affordance) → Acceptable; profile editing is a separate future capability
