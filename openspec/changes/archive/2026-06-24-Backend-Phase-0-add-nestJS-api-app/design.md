## Context

The repository is a Bun-powered Turborepo with two Next.js apps and shared packages. Current architecture avoids an HTTP API layer for frontend data access, but the requested feature is a separate Node.js/NestJS app. The new app should fit the monorepo conventions without forcing existing apps to migrate to HTTP.

## Goals / Non-Goals

**Goals:**
- Add a NestJS HTTP API app under `apps/api`
- Keep Bun as the package manager and script runner
- Integrate with existing Turbo tasks
- Use Nest's default Express platform
- Use Vitest for tests, matching the repository's existing test tooling
- Provide a minimal health endpoint
- Use strict TypeScript with Nest decorator metadata enabled
- Keep the app independent from existing frontend routes and Prisma clients for the initial scaffold

**Non-Goals:**
- Replace `@repo/api-client`
- Move existing Next.js server actions to Nest
- Add authentication, Prisma access, Swagger, GraphQL, queues, or background workers
- Add Jest or Nest's default Jest test configuration
- Change existing app ports `3000` and `3001`
- Modify database schema or seed data

## Decisions

### App workspace

Create `apps/api` with package name `@repo/api`. This follows the existing app workspace pattern and lets Turbo target the app with `--filter=@repo/api`.

### Runtime and scripts

Use Bun for workspace script execution. The Nest development script will run the Nest CLI in watch mode. Production start will run compiled JavaScript from `dist/main`.

Expected scripts:
- `dev`: `nest start --watch`
- `build`: `nest build`
- `start`: `node dist/main`
- `lint`: `eslint "src/**/*.ts"`
- `typecheck`: `tsc --noEmit`
- `test`: `vitest run`

### Test tooling

Use Vitest for unit tests instead of Nest's default Jest setup. Do not add Jest config, Jest dependencies, or `.spec.ts` patterns that require Jest globals unless they are compatible with Vitest imports.

### HTTP platform and port

Use `@nestjs/platform-express`, the Nest default HTTP adapter. The app listens on `process.env.PORT ?? 3002`, avoiding the existing Next.js ports.

### TypeScript configuration

The root TypeScript config is optimized for Next.js and browser-oriented module resolution, so the Nest app needs local configs:
- `tsconfig.json` for strict app typechecking with decorators enabled
- `tsconfig.build.json` for emitted build output, excluding tests and `dist`

### Initial API surface

Expose `GET /health` returning a small JSON payload such as `{ status: 'ok' }`. This validates that the Nest app boots and gives a stable readiness endpoint without introducing business-domain API contracts.

### Traceability

Add `@openspec` annotations to key app entry/controller/service files during implementation, because `CLAUDE.md` requires traceability annotations for controllers, services, and application entry points.

## Risks / Trade-offs

- Adding Nest introduces a second backend style alongside direct Prisma package clients, so the initial scope must stay clearly limited.
- Nest requires decorator metadata settings that should remain app-local to avoid disturbing Next.js TypeScript behavior.
- The app has no business API at first; the health endpoint is intentionally minimal to establish the workspace safely.
