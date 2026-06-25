## App responsibilities

| App               | Purpose                                                                      |
|-------------------|------------------------------------------------------------------------------|
| `apps/main`       | User-facing product — feed, post composer, profiles, explore, notifications  |
| `apps/nodes-list` | Internal/admin — user list, post moderation                                  |

## Principles

- **Graph-first exploration** — when `graphify-out/` exists, query the graphify knowledge graph before reading files or starting implementation; use direct file exploration only for gaps the graph cannot answer
- **Feature-first structure** — all code lives under `src/features/<name>/`; no flat file dumps at `src/`
- **No HTTP layer** — `@repo/api-client` calls Prisma directly; avoid REST/GraphQL unless a real need emerges
- **One Prisma instance** — always import from `@repo/shared/features/database`; never instantiate `PrismaClient` elsewhere
- **Named function declarations** — React components use `function Foo()`, not arrow functions (ESLint enforced)
- **Types are shared** — domain types live in `@repo/types`; packages and apps import from there, not from each other
- **Specs before code** — every non-trivial feature gets a spec in `openspec/` before implementation starts

# Development Workflow

## Feature Development

All non-trivial features start as a change inside:

openspec/changes/<feature-name>/

Each change should contain:
- design.md
- tasks.md

Implementation must not begin until design and tasks are reviewed.

After a feature is completed and accepted:
- the resulting behavior is documented in openspec/specs/
- the change is archived

## Libs and Packages
**Use Tailwind CSS**

## Testing
Business logic: Vitest
UI: React Testing Library


Feed requires viewerId.
Authentication will be added later.
Development may use a seeded demo user.
