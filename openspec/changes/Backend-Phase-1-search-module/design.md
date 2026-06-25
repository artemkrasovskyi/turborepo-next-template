## Context

The app already supports user search on `/explore` through `@repo/api-client/features/search`, which calls Prisma directly. The Nest API app exists separately and already exposes health behavior plus shared Prisma access.

Backend Phase 1 adds a Nest-owned search module while keeping current frontend behavior unchanged. This creates a backend search boundary without forcing the main app to migrate from direct package clients yet.

## Goals / Non-Goals

**Goals:**
- Add a backend `SearchModule` under `apps/api`
- Expose `GET /search/users`
- Search users by `username` or `displayName`
- Support cursor pagination and optional viewer-specific `isFollowing`
- Return only public user fields plus follow state
- Reuse existing Prisma access through `PrismaService`
- Test the module with Vitest

**Non-Goals:**
- Change `/explore` or any frontend route
- Replace `@repo/api-client/features/search`
- Add post search, hashtag search, unified search, fuzzy search, or typeahead
- Add authentication or session-derived viewer identity
- Modify Prisma schema, migrations, or seed data

## Decisions

### API shape

Use `GET /search/users` with query parameters:
- `query`: required after trimming; empty values return an empty page
- `cursor`: optional user id cursor
- `limit`: optional page size, default `20`, capped at `20`
- `viewerId`: optional user id used only to calculate `isFollowing`

The endpoint returns `FollowListPage` from `@repo/types/features/follow`.

### Search semantics

Search users with a case-insensitive `contains` match on `username` and `displayName`. Order results by `createdAt asc`, use `id` as the cursor, fetch one extra record to determine `nextCursor`, and do not expose private fields such as email, sessions, accounts, or verification data.

### Viewer state

Until backend auth/session behavior is specified, viewer state is optional and supplied as `viewerId`. When `viewerId` is absent, all returned users have `isFollowing: false`. When present, the service batches follow lookups for returned user ids.

### Module structure

Add `SearchModule`, `SearchController`, and `SearchService` under `apps/api/src/features/search/`. Register `SearchModule` in `AppModule`. Add `@openspec` traceability annotations to the controller and service.

### Testing

Use Vitest with mocked Prisma access. Tests should cover query trimming, empty query behavior, Prisma search arguments, pagination, optional viewer follow state, and returned field privacy.

## Risks / Trade-offs

- Keeping frontend search unchanged means duplicate search logic temporarily exists in `@repo/api-client` and `apps/api`.
- Optional `viewerId` is not secure enough for protected behavior, but Phase 1 only uses it for public follow-state decoration and mirrors current package-client behavior.
- Plain `contains` search is intentionally simple; better ranking, fuzzy matching, and full-text search can be added in later phases.
