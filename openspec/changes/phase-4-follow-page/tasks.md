## Types

1. Add `FollowListUser` and `FollowListPage` to `packages-types/src/features/follow/index.ts`

## API client

2. Add `getFollowers()` to `createFollowClient()` in `packages/api-client/src/features/follow/index.ts` — cursor-based pagination on `Follow` where `followingId = userId`, batch `isFollowing` check
3. Add `getFollowing()` to `createFollowClient()` — cursor-based pagination on `Follow` where `followerId = userId`, batch `isFollowing` check

## Server actions

4. Add `loadMoreFollowersAction` to `apps/main/src/features/follow/actions.ts`
5. Add `loadMoreFollowingAction` to `apps/main/src/features/follow/actions.ts`

## Components

6. Create `follow-user-card.tsx` — compact profile card with avatar initials, name/username link, and `FollowButton` (hidden on viewer's own card)
7. Create `followers-list.tsx` — client component with initial data + load-more via `loadMoreFollowersAction`
8. Create `following-list.tsx` — client component with initial data + load-more via `loadMoreFollowingAction`

## Routes

9. Create `apps/main/src/app/profile/[username]/followers/page.tsx`
10. Create `apps/main/src/app/profile/[username]/followers/loading.tsx`
11. Create `apps/main/src/app/profile/[username]/following/page.tsx`
12. Create `apps/main/src/app/profile/[username]/following/loading.tsx`

## ProfileHeader

13. Convert `followerCount` and `followingCount` spans in `profile-header.tsx` to `<Link>` elements pointing to the respective pages
