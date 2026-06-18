## Context

Every feature built so far assumes the viewer already knows who to follow. There is no way to
discover new users or find content beyond the home feed. The architecture spec already names
`explore` as part of `apps/main`'s responsibilities, but no `/explore` route exists yet.

This phase adds a single entry point for discovery at `/explore` covering four surfaces:
user search, an explore landing page, a recent users section, and trending posts. All four
are server-rendered and driven by existing Prisma models — no schema changes are needed.

Existing conventions:
- Feature-first: all new code under `src/features/search/`
- `@repo/api-client` calls Prisma directly via a new `createSearchClient()` factory
- Cursor-based pagination for user search; no pagination for recent users / trending posts
  (both are fixed-size lists on the explore page)
- Reuse `FollowListUser` / `FollowListPage` from `@repo/types/features/follow` and
  `FeedItem` from `@repo/types/features/feed` — no new types needed
- Search state via `?q=` query param — server component reads `searchParams`; no client-side
  search state

## Goals / Non-Goals

**Goals:**

- `/explore` landing page showing recent users and trending posts when no search query is active
- User search by username or display name, triggered by `?q=<query>`, results on the same page
- Recent users — the most recently joined users (newest first), fixed list of 12, no pagination
- Trending posts — top-level posts with the most likes in the last 7 days, fixed list of 20,
  no pagination
- Nav bar gains an Explore link (Home / Explore / Notifications / Profile)
- Each user result has a follow button; each post result reuses the existing `FeedItem` component

**Non-Goals:**

- Full-text / fuzzy search — plain `contains` (case-insensitive) on `username` and `displayName`
  is sufficient for MVP
- Post search (searching post body text)
- Hashtag or topic search
- Search history or saved searches
- Real-time / typeahead search
- Trending algorithm beyond like count over a rolling 7-day window
- Explore pagination — both recent users and trending posts are fixed-size lists

## Requirements

### Requirement: User Search

The system SHALL allow a viewer to search for users by typing into a search bar on the explore
page, which submits to `/explore?q=<query>`.

#### Scenario: Query matches users

- **WHEN** the viewer submits a non-empty query
- **THEN** the system SHALL display users whose `username` or `displayName` contains the query
  (case-insensitive), paginated 20 per page, with a "Load more" control if more exist

#### Scenario: Query matches no users

- **WHEN** the viewer submits a query that matches no users
- **THEN** the system SHALL display an empty state indicating no users were found

#### Scenario: Empty query

- **WHEN** the viewer navigates to `/explore` with no `q` param or clears the search bar
- **THEN** the system SHALL display the explore landing page (recent users + trending posts)

### Requirement: Recent Users

The system SHALL display a fixed list of the most recently joined users on the explore landing
page.

#### Scenario: Users exist

- **WHEN** the viewer opens `/explore` with no search query
- **THEN** the system SHALL display up to 12 users ordered by `createdAt` descending

#### Scenario: No users other than viewer

- **WHEN** no users exist beyond the viewer
- **THEN** the system SHALL display an empty state for the recent users section

### Requirement: Trending Posts

The system SHALL display a fixed list of the most-liked top-level posts from the last 7 days on
the explore landing page.

#### Scenario: Trending posts exist

- **WHEN** the viewer opens `/explore` with no search query
- **THEN** the system SHALL display up to 20 top-level posts ordered by like count descending,
  then by `createdAt` descending as a tiebreaker, where `createdAt >= now - 7 days`

#### Scenario: No posts in the last 7 days

- **WHEN** no top-level posts were created or liked in the last 7 days
- **THEN** the system SHALL display an empty state for the trending posts section

### Requirement: Nav Bar — Explore Link

The system SHALL add an Explore link to the persistent nav bar so viewers can reach the
explore page from any route.

#### Scenario: Viewer navigates to explore

- **WHEN** the viewer clicks the Explore nav link
- **THEN** the system SHALL navigate to `/explore`

## Decisions

### 1. Single route — `/explore` handles both landing and search

When `searchParams.q` is absent or empty, the page renders two sections (recent users,
trending posts). When `q` is present, it renders user search results instead. This avoids a
separate `/search` route and keeps the nav link to a single destination.

`export const dynamic = 'force-dynamic'` on the page, same as other data-driven pages.

### 2. New api-client feature — `packages/api-client/src/features/search/index.ts`

```ts
export function createSearchClient() {
  return {
    async searchUsers({ query, viewerId, cursor, limit }: SearchUsersParams): Promise<FollowListPage>,
    async getRecentUsers({ viewerId, limit }: RecentUsersParams): Promise<FollowListUser[]>,
    async getTrendingPosts({ viewerId, days, limit }: TrendingPostsParams): Promise<FeedItem[]>,
  };
}
```

Add `"./features/search": "./src/features/search/index.ts"` to `packages/api-client/package.json`
exports. No new entry needed in `packages-types` — all return types already exist.

### 3. `searchUsers` — Prisma query

```ts
const users = await prisma.user.findMany({
  where: {
    OR: [
      { username: { contains: query, mode: 'insensitive' } },
      { displayName: { contains: query, mode: 'insensitive' } },
    ],
  },
  orderBy: { createdAt: 'asc' },
  take: pageSize + 1,
  ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  select: { id: true, username: true, displayName: true, avatarUrl: true },
});
```

Batch `isFollowing` check after fetch — same pattern as `getFollowers`/`getFollowing` in the
follow api-client.

### 4. `getRecentUsers` — Prisma query

```ts
const users = await prisma.user.findMany({
  orderBy: { createdAt: 'desc' },
  take: limit ?? 12,
  select: { id: true, username: true, displayName: true, avatarUrl: true },
});
```

Returns `FollowListUser[]` (flat array, no cursor). Batch `isFollowing` applied after.

### 5. `getTrendingPosts` — Prisma query

```ts
const since = new Date(Date.now() - (days ?? 7) * 24 * 60 * 60 * 1000);

const posts = await prisma.post.findMany({
  where: { parentId: null, createdAt: { gte: since } },
  orderBy: [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }],
  take: limit ?? 20,
  include: {
    author: { select: { id, username, displayName, avatarUrl } },
    _count: { select: { replies: true, likes: true } },
    likes: { where: { userId: viewerId ?? '' }, select: { userId: true }, take: 1 },
  },
});
```

Returns `FeedItem[]` (flat array, no cursor) mapped from the Prisma result using the same
shape as `getProfilePosts`.

### 6. Server action for load-more user search

`loadMoreUserSearchAction(query, cursor, viewerId?)` — server action in
`apps/main/src/features/search/actions.ts` — called by the client `UserSearchResults`
component when the viewer clicks "Load more".

Recent users and trending posts are fixed-size and have no load-more.

### 7. `SearchBar` — client component with form

`'use client'` form that pushes `?q=<value>` to the router on submit (using Next.js
`useRouter().push`). Cleared by navigating to `/explore` with no query.

```tsx
'use client';
import { useRouter } from 'next/navigation';

export function SearchBar({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  // controlled input, onSubmit pushes `/explore?q=<value>`
}
```

### 8. Components

All under `apps/main/src/features/search/components/`:

| Component | Type | Purpose |
|---|---|---|
| `search-bar.tsx` | client | Search form — pushes `?q=` on submit |
| `user-search-results.tsx` | client | Paginated user results with load-more |
| `recent-users.tsx` | server | Fixed grid of `FollowUserCard`s |
| `trending-posts.tsx` | server | Fixed list of `FeedItem`s |

`FollowUserCard` (already exists in `features/follow/components/`) is reused directly.
`FeedItem` (already exists in `features/feed/components/`) is reused directly.

### 9. Loading skeleton — `/explore/loading.tsx`

Search bar skeleton (`SkeletonLine h-10 w-full`) + two section skeletons (heading line + grid
of `SkeletonCard`s).

### 10. Nav bar update

Add Explore between Home and Notifications in `apps/main/src/features/nav/components/nav-bar.tsx`:

```tsx
<Link href="/explore" className={linkClasses}>
  <span aria-hidden="true">🔍</span>
  <span>Explore</span>
</Link>
```

Four links fit the existing `justify-around` mobile layout and `sm:gap-2` desktop layout
without any changes to the nav bar's container.

## Risks / Trade-offs

- [Risk] `contains` on `username`/`displayName` does a full table scan without an index — for
  MVP with hundreds of users this is fine; add `@@index([username])` / full-text index before
  reaching thousands
- [Risk] Trending posts uses `orderBy: [{ likes: { _count: 'desc' } }]` which Prisma translates
  to a subquery or join — acceptable for 20 posts over 7 days; may need a materialized view at
  scale
- [Risk] `force-dynamic` on `/explore` means every visit hits the DB — acceptable for MVP;
  could add `revalidate = 60` (ISR) later to reduce load
- [Risk] Search result cursor is the user `id` (cuid) — stable and unique, safe for pagination
- [Risk] Trending window is hardcoded at 7 days — simple and predictable; make it configurable
  if editorial needs change