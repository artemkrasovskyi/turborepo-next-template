## Why

The NestJS API app now has Prisma access, but search behavior still lives in the frontend-facing `@repo/api-client` package. Backend Phase 1 should introduce a dedicated Nest search module so backend search can become a first-class API capability without changing the existing `/explore` UI flow yet.

## What Changes

- Add a Nest search module to `apps/api`.
- Expose user search through `GET /search/users`.
- Reuse the existing Prisma integration through `PrismaService`.
- Return the same user-search page shape currently used by the app: `FollowListPage`.
- Preserve existing `@repo/api-client/features/search` and `apps/main` explore behavior.

## Impact

- Adds a public backend search API for users.
- Does not add post search, unified search, full-text search, or typeahead behavior.
- Does not modify Prisma schema, migrations, seed data, or frontend routes.
- Keeps default tests independent from a live PostgreSQL instance by mocking Prisma.
