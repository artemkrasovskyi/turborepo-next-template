1. Create shared follow types (`packages-types/src/features/follow`) — `ToggleFollowResult`
2. Create follow client (`packages/api-client/src/features/follow`) — `follow()`/`unfollow()`, idempotent via `upsert`/`deleteMany`
3. Add `isFollowing` to `ProfileUser` and extend `getProfileByUsername` to accept an optional `viewerId`
4. Create `toggleFollowAction` server action with self-follow validation and revalidation
5. Create `FollowButton` component with optimistic toggle and error handling
6. Render `FollowButton` in `ProfileHeader`, hidden on the viewer's own profile
7. Resolve the viewer in the profile page and pass `viewerId` through to `getProfileByUsername` and `ProfileHeader`
8. Update package exports (`packages-types`, `packages/api-client`) for the follow feature
