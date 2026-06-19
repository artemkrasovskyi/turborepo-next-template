## 1. Dependencies and Database

- [x] 1.1 Add Better Auth and Prisma adapter dependencies to `apps/main`
- [x] 1.2 Extend `User` with `email`, `emailVerified`, and `updatedAt`
- [x] 1.3 Add `Session`, `Account`, and `Verification` Prisma models
- [x] 1.4 Create `20260619160000_add_auth` migration with backfill for existing users
- [x] 1.5 Run Prisma migration deploy
- [x] 1.6 Run Prisma Client generation

## 2. Auth Integration

- [x] 2.1 Add Better Auth server config using the shared Prisma instance
- [x] 2.2 Configure Better Auth field mapping from `name` to `displayName` and `image` to `avatarUrl`
- [x] 2.3 Enable email/password auth
- [x] 2.4 Add `nextCookies()` plugin
- [x] 2.5 Mount `/api/auth/[...all]` route with `toNextJsHandler(auth)`
- [x] 2.6 Add client auth helper with `createAuthClient()`

## 3. Viewer Resolution

- [x] 3.1 Add `getViewerUser()` that resolves the current session through Better Auth
- [x] 3.2 Add `requireViewerUser()` for protected pages
- [x] 3.3 Replace app route usage of seeded `createUsersClient().getViewerUser()`
- [x] 3.4 Keep public pages public while passing viewer state when a session exists
- [x] 3.5 Protect home, notifications, bookmarks, inbox, and conversation routes

## 4. Auth UI

- [x] 4.1 Add `/sign-in` page
- [x] 4.2 Add `/sign-up` page
- [x] 4.3 Add sign-in form using Better Auth email/password
- [x] 4.4 Add sign-up form collecting display name, username, email, and password
- [x] 4.5 Add nav sign-out button
- [x] 4.6 Refresh/redirect after sign-in, sign-up, and sign-out

## 5. Server Action Security

- [x] 5.1 Update post creation to derive `authorId` from the server session
- [x] 5.2 Update reply creation to derive `authorId` from the server session
- [x] 5.3 Update follow, like, repost, and bookmark actions to derive the actor from the server session
- [x] 5.4 Update profile edit action to derive the edited user from the server session
- [x] 5.5 Update direct-message actions to derive viewer/sender from the server session
- [x] 5.6 Remove trusted actor-id arguments from client component action calls

## 6. Seed Data

- [x] 6.1 Update seed script to create Better Auth credential accounts
- [x] 6.2 Use deterministic demo emails in the form `<username>@example.test`
- [x] 6.3 Use shared demo password `password1234`
- [x] 6.4 Reset dependent demo tables before reseeding
- [x] 6.5 Run the seed script after migration

## 7. Tests and Verification

- [x] 7.1 Update focused Server Action tests for server-derived viewer identity
- [x] 7.2 Run focused action tests
- [x] 7.3 Run `bun run typecheck`
- [x] 7.4 Run `bun run test`
- [x] 7.5 Run `bun run lint`
- [x] 7.6 Start the dev server and verify `/sign-in` responds
