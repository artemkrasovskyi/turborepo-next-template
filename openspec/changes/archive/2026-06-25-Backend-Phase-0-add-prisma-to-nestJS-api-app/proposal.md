## Why

The NestJS API app exists as a backend workspace, but Phase 0 intentionally kept it limited to the HTTP scaffold and health endpoint. To make the API app ready for backend feature work, it needs database access through the repository's existing Prisma setup.

## What Changes

- Add Prisma access to `apps/api` through the existing `@repo/shared/features/database` singleton.
- Add an injectable Nest provider that wraps the shared Prisma client for Nest services and controllers.
- Add a database health check that verifies Prisma connectivity without exposing business data.
- Add Vitest coverage for Prisma provider wiring and database health behavior.
- Keep existing `@repo/api-client` direct Prisma calls unchanged.

## Impact

- Extends the Nest API app with database connectivity.
- Reuses the repo's one-Prisma-instance rule instead of creating a second `PrismaClient`.
- Requires `apps/api` to depend on `@repo/shared`.
- Does not require Prisma schema, migration, or seed changes.
