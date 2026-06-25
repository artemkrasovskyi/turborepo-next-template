# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root using `bun`.

```sh
bun run dev          # start all apps in parallel (main: 3000, nodes-list: 3001)
bun run build        # turbo build (respects dependency order)
bun run lint         # ESLint across all workspaces
bun run typecheck    # tsc --noEmit across all workspaces
bun run stylelint    # Stylelint CSS/SCSS across all workspaces
bun run format       # Prettier write
bun run format:check # Prettier check (CI)

# Database (Prisma)
bun run db:generate  # regenerate Prisma Client after schema changes
bun run db:migrate   # run migrations (dev)
bun run db:studio    # open Prisma Studio
```

To run a command for a single workspace only, use `--filter`:

```sh
bunx turbo lint --filter=@repo/main
bunx turbo typecheck --filter=@repo/shared
```

## Local setup

```sh
cp .env.example .env
docker compose up -d   # start PostgreSQL on port 5432
bun install
bun run db:generate
bun run dev
```

## Codebase Exploration

When `graphify-out/` exists in the repo root, query the graphify knowledge graph **before** exploring files or starting implementation. Use the `graphify` skill to query architecture, file relationships, and codebase structure. Only fall back to direct file exploration for questions the graph cannot answer.

**Stop after the graph answers.** Do not re-read files that the graph already described. Querying the graph and then also reading the same files defeats the purpose and doubles token usage.

## Architecture

This is a Turborepo monorepo using Bun as the package manager.
**Use TanStack Query for server state**
**Use shared types from @repo/types**
**Use function declarations for React components**

### Workspaces

| Workspace             | Package name       | Purpose                                               |
| --------------------- | ------------------ | ----------------------------------------------------- |
| `apps/main`           | `@repo/main`       | Primary Next.js app (port 3000)                       |
| `apps/nodes-list`     | `@repo/nodes-list` | Secondary Next.js app (port 3001)                     |
| `packages/shared`     | `@repo/shared`     | Prisma client singleton, app config utilities         |
| `packages/api-client` | `@repo/api-client` | Data-fetching clients (direct Prisma calls, not HTTP) |
| `packages-types`      | `@repo/types`      | Shared TypeScript types                               |

### Dependency graph

```
apps/* → @repo/api-client → @repo/shared → @prisma/client
apps/* → @repo/shared
apps/* → @repo/types
@repo/api-client → @repo/types
```

### Key patterns

**Feature-based layout** — all workspaces organise code under `src/features/<feature-name>/`. Adding a new feature means creating a directory there, not at the root of `src`.
**Package exports** — packages use explicit `exports` in `package.json` (e.g. `"./features/notes": "./src/features/notes/index.ts"`). Add a new export entry whenever a new feature module is created in a package.
**Transpiled packages** — both Next.js apps list shared packages in `transpilePackages` in `next.config.mjs` so TypeScript sources are resolved directly without a build step.
**Prisma singleton** — `@repo/shared/features/database` exports a single `prisma` instance (guarded on `globalThis` in dev). Import from there; never instantiate `PrismaClient` elsewhere.
**api-client calls Prisma directly** — there is no HTTP API layer. `@repo/api-client` imports the `prisma` singleton and runs queries. Client functions are created with a factory (`createNotesClient()`).
**Use typeScript strict mode**

# OpenSpec Workflow

All behavior-changing work must follow the OpenSpec workflow.

## Requirements

- Create changes under `openspec/changes/<change-id>/`
- Each change must contain:
  - `proposal.md`
  - `design.md`
  - `tasks.md`
  - spec deltas under `specs/`

- Run validation before implementation:

```bash
openspec validate <change-id> --strict
```

- Do not begin implementation until the change has been reviewed.
- Archive completed changes:

```bash
openspec archive <change-id> --yes
```

- Do not modify durable specs directly. Update them through the OpenSpec archive workflow.

# Spec Traceability

All implemented OpenSpec changes must be traceable from specification to code.

## Requirements

- Add traceability annotations to key implementation files.
- Use annotations only in:
  - route files
  - server actions
  - API clients
  - services
  - controllers
  - application entry points

- Do not annotate every small UI component.

- Before modifying an existing feature:
  1. Locate related `@openspec` annotations.
  2. Read the referenced specification.
  3. Review the existing implementation before proposing changes.

## Annotation Format

```ts
/**
 * @openspec openspec/specs/feed/spec.md
 * @change add-feed-and-thread
 */
```

## Example Locations

```text
apps/main/src/app/page.tsx
apps/main/src/features/feed/actions.ts
packages/api-client/src/features/feed/index.ts
apps/api/src/search/search.service.ts
```

### Linting & formatting rules

- ESLint extends Airbnb + `airbnb-typescript` + Prettier. Named React components must use **function declarations**, not arrow functions.
- Prettier: single quotes, trailing commas everywhere, 100-char print width.
- Stylelint uses `stylelint-config-standard` with Tailwind at-rules allowed.
