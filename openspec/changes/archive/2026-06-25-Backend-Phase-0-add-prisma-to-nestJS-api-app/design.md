## Context

The monorepo already exposes a Prisma singleton from `@repo/shared/features/database`. Existing package clients use that shared export directly, and the architecture spec requires all Prisma usage to go through the shared singleton rather than instantiating `PrismaClient` in multiple places.

The NestJS API app should follow the same rule while still using Nest's dependency injection patterns.

## Goals / Non-Goals

**Goals:**
- Add Prisma access to `apps/api`
- Use `@repo/shared/features/database` as the only Prisma client source
- Provide a Nest injectable provider for Prisma access
- Add a database health check endpoint or health response field backed by a lightweight Prisma query
- Test Prisma provider wiring with Vitest

**Non-Goals:**
- Instantiate `PrismaClient` directly in `apps/api`
- Replace `@repo/api-client`
- Move existing frontend data fetching to the Nest API
- Add business-domain API endpoints
- Modify Prisma schema, migrations, or seed data
- Add authentication or authorization behavior

## Decisions

### Shared Prisma source

`apps/api` must add `@repo/shared` as a workspace dependency and import the existing Prisma singleton from `@repo/shared/features/database`.

The API app must not import `PrismaClient` from `@prisma/client` for construction. Type-only imports are acceptable when needed, but client lifecycle ownership stays in `@repo/shared`.

### Nest provider boundary

Add a small injectable provider, such as `PrismaService`, that exposes the shared `prisma` singleton to Nest services and controllers. This keeps Nest code idiomatic while preserving the monorepo's single-client rule.

### Database health behavior

Add minimal database health behavior that performs a lightweight Prisma query, such as `$queryRaw` with a constant select. The response should indicate database connectivity and must not expose users, posts, sessions, or other business data.

The existing `GET /health` endpoint may include database status, or a separate health route may be added. The implementation should keep the public contract minimal and readiness-oriented.

### Testing

Use Vitest, not Jest. Unit tests should mock `@repo/shared/features/database` so Prisma provider wiring can be verified without requiring a live database. Any live database verification belongs in manual or integration verification, not the default unit test path.

## Risks / Trade-offs

- Prisma integration can accidentally create duplicate database clients if the Nest app constructs `PrismaClient`; the implementation must wrap the shared singleton.
- A database-backed health check can fail when PostgreSQL is not running, so default unit tests should mock Prisma and avoid requiring local infrastructure.
- Adding database status to health output expands the API surface slightly; the response should stay readiness-focused.
