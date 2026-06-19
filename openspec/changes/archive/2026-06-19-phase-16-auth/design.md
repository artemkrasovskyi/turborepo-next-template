## Context

Flock previously resolved the current viewer through `createUsersClient().getViewerUser()`, which returned the first seeded demo user. That made development simple, but it meant every visitor acted as the same user and many Server Actions trusted `viewerId`, `authorId`, or `senderId` values sent from the browser.

Phase 16 adds real session-based authentication:
- Better Auth with Prisma/PostgreSQL
- email/password sign-in and sign-up
- session-backed viewer resolution
- protected private routes
- server-derived actor ids for authenticated mutations
- auth-backed demo seed users

## Goals / Non-Goals

**Goals:**
- Replace the seeded demo viewer fallback with a real signed-in session
- Let users create accounts and sign in with email/password
- Preserve the existing Flock `User` model as the product user record
- Keep public browsing for profiles, post threads, explore, followers/following, and likes
- Require authentication for home feed, post creation, notifications, bookmarks, and direct messages
- Stop trusting client-supplied acting user ids in mutation Server Actions
- Keep local demo data usable through deterministic seeded credentials

**Non-Goals:**
- OAuth providers
- Magic links
- Email verification delivery
- Password reset email delivery
- Two-factor auth, passkeys, or account deletion
- Roles, permissions, or admin auth
- A separate hosted identity provider

## Decisions

### Better Auth owns sessions and credential accounts

Use Better Auth with the Prisma adapter:

```ts
betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  plugins: [nextCookies()],
});
```

Mount the handler at `/api/auth/[...all]` using `toNextJsHandler(auth)`. Use `nextCookies()` so Better Auth can set cookies from Next.js Server Action flows when needed.

### Reuse Flock's existing `User` model

Do not introduce a parallel auth-only user table. Extend `User` with the Better Auth core fields:
- `email`
- `emailVerified`
- `updatedAt`

Map Better Auth fields to existing app fields:
- Better Auth `name` maps to `User.displayName`
- Better Auth `image` maps to `User.avatarUrl`

Keep `username`, `bio`, and all social relations on `User`. Add Better Auth `Session`, `Account`, and `Verification` models. Existing local data is backfilled with `username@example.test` emails and `updatedAt = createdAt`.

### Viewer resolution is app-local

Add app auth helpers under `apps/main/src/features/auth`:
- `auth` config
- `authClient`
- `getViewerUser()`
- `requireViewerUser()`

`getViewerUser()` calls `auth.api.getSession({ headers })`, then loads the app-facing `ViewerUser` shape from Prisma. `@repo/api-client` remains a direct Prisma client package and does not import Next.js request APIs.

### Mutation actions derive actor identity from the server session

Authenticated mutations must resolve the acting user server-side. Client components may pass target ids such as `postId`, `targetUserId`, `conversationId`, or content fields, but must not pass trusted actor ids.

Updated actions include:
- creating posts and replies
- toggling follows, likes, reposts, and bookmarks
- editing the viewer's profile
- starting and sending direct messages
- loading private inbox/bookmark/message pages

### Route auth boundaries

Protected:
- `/`
- `/notifications`
- `/bookmarks`
- `/messages`
- `/messages/[conversationId]`

Public with signed-out interaction states:
- `/explore`
- `/profile/[username]`
- `/profile/[username]/likes`
- `/profile/[username]/followers`
- `/profile/[username]/following`
- `/posts/[id]`
- `/sign-in`
- `/sign-up`

### Demo seed users are credential-backed

The seed script resets demo data and recreates users with Better Auth credential accounts. Every seeded user's email is `<username>@example.test` and the shared demo password is `password1234`.

This keeps the demo social graph usable while ensuring the app no longer depends on a hidden first-user fallback.

## Risks / Trade-offs

- **Single app-local auth integration**: auth helpers live in `apps/main`, not shared packages. This keeps Next.js request APIs out of `@repo/api-client`, but `apps/nodes-list` does not yet have auth.
- **Email verification is not enforced**: email/password works without outbound email infrastructure. This is acceptable for MVP but should be revisited for production.
- **Seed reset is destructive**: `bun run db:seed` clears existing demo tables before rebuilding auth-backed demo data. This matches the current demo workflow but is not a production migration strategy.
- **Existing public UI still receives viewer ids for rendering**: non-authoritative `viewerId` props remain for display state and pagination where needed. Privileged Server Actions no longer trust those ids as authority.
