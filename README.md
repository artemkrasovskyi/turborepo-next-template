# Monorepo Next Example

Bun-powered Turborepo workspace with Next.js apps, PostgreSQL, Prisma, Tailwind,
Prettier, ESLint with Airbnb rules, and Stylelint.

## Structure

```txt
apps/main
apps/nodes-list
packages/shared
packages/api-client
packages-types
```

Each workspace starts with a feature-based layout under `src/features`.

## Setup

1. Install Bun and make sure `bun` is available on your PATH.
2. Copy `.env.example` to `.env`.
3. Start PostgreSQL:

```sh
docker compose up -d
```

4. Install dependencies and generate Prisma Client:

```sh
bun install
bun run db:generate
```

5. Run the workspace:

```sh
bun run dev
```

The main app runs on port `3000`, and the notes list app runs on port `3001`.

## Useful Scripts

```sh
bun run build
bun run lint
bun run stylelint
bun run typecheck
bun run format
bun run db:migrate
bun run db:studio
```
