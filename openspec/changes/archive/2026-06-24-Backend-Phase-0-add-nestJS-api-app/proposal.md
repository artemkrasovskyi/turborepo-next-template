## Why

The monorepo currently contains only Next.js apps and direct Prisma-backed package clients. We need a Node.js backend application using NestJS so the repo can host server-side HTTP API behavior as a first-class app while keeping the existing Bun and Turborepo workflow.

## What Changes

- Add a new NestJS HTTP API workspace at `apps/api`.
- Register the app as package `@repo/api`.
- Add standard Turbo-compatible scripts for dev, build, lint, typecheck, and test.
- Use Vitest for tests to match repository tooling instead of Nest's default Jest setup.
- Add a minimal health endpoint for local and deployment readiness checks.
- Configure Nest-specific TypeScript build settings without changing the frontend-oriented root TypeScript defaults.
- Document the new app in the repo setup instructions.

## Impact

- Adds a new application workspace under the existing `apps/*` workspace pattern.
- Adds NestJS runtime and development dependencies.
- Keeps existing Next.js apps, Prisma behavior, and package APIs unchanged.
- Introduces an intentional HTTP API layer only for the new Nest app; existing `@repo/api-client` direct Prisma calls remain unchanged.
