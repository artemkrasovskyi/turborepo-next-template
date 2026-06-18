## Context

`apps/main` now has working feed, post-composer, post-thread, profile, follow, and
notifications capabilities, each designed and implemented independently. No
cross-cutting consistency pass has been done. As a result:

- Empty states are styled inconsistently — most use a shared
  `rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center` card
  with a heading and description, but "No replies yet." (thread page) and
  "No notifications yet." (notifications page) are bare `<p>` tags.
- Only `app/loading.tsx` exists, showing a generic feed-shaped skeleton. Navigating
  to `/posts/[id]`, `/profile/[username]`, or `/notifications` shows that same
  feed-shaped skeleton, which doesn't match the destination layout.
- There is no persistent navigation — the only nav link anywhere is one
  `<Link href="/notifications">` in the home page header.
- There are zero responsive Tailwind breakpoints; every page container is a fixed
  `max-w-2xl`.
- Almost no accessibility affordances exist: no focus-visible styles except on the
  two composer textareas, `LikeButton` is emoji-only with no `aria-label`/
  `aria-pressed`, inline error messages aren't announced to assistive technology,
  and there is no `<nav>` landmark.
- There is no test infrastructure anywhere in the repo, and `createPostAction` /
  `createReplyAction` duplicate the same trim/empty/length validation with
  near-identical (differently-worded) error messages.

This change addresses all of the above as one "polish" pass over `apps/main`.

Existing conventions to follow (`openspec/specs/architecture/spec.md`, and prior
implementations):

- Feature-first layout under `src/features/<name>/` — new cross-cutting UI
  primitives go into `src/features/ui/` and `src/features/nav/`
- `viewerId`/`ViewerUser` resolved via `createUsersClient().getViewerUser()`
- Tailwind styling matching existing card/button/empty-state conventions
- Server Actions (`'use server'`) wrap `@repo/api-client` mutation calls

## Goals / Non-Goals

**Goals:**

- Consistent, reusable empty-state UI wherever a list or lookup has no results
- Route-shaped loading skeletons for every top-level route, plus skeleton feedback
  while "load more" requests are pending
- A persistent navigation bar (Home / Notifications / Profile) visible on every page
  where a viewer exists
- Responsive container width and nav placement across mobile/desktop breakpoints
- Baseline accessibility: visible keyboard focus indicators, accessible names and
  states for icon-only controls, live-region announcements for inline errors, and a
  `<nav>` landmark
- A shared `validatePostBody` function used by both post and reply creation, with
  unit test coverage
- Vitest + React Testing Library configured as the test stack, with unit tests for
  the extracted validation logic and the `follow`/`likes` toggle actions

**Non-Goals:**

- `apps/nodes-list` — out of scope, remains an unstyled placeholder
- Component/UI tests with React Testing Library — RTL is installed and configured
  as infrastructure for future component tests; this pass only adds unit tests for
  validation logic and server actions
- Active-link highlighting in the nav bar (`usePathname`-based styling)
- A new icon library/SVG icon set — the nav bar uses emoji + visible text labels
- Authentication — continues to use `getViewerUser()`
- Archiving this change into `openspec/specs/` — a separate follow-up step

## Requirements

### Requirement: Empty States

The system SHALL display a consistent empty-state UI (heading + description) in a
dashed-border card wherever a list or lookup has no results.

#### Scenario: Home feed has no posts

- **WHEN** the viewer's home feed contains no posts
- **THEN** the system SHALL display an empty-state card inviting them to follow
  other people

#### Scenario: Profile has no posts

- **WHEN** a profile's post list is empty
- **THEN** the system SHALL display an empty-state card indicating the user hasn't
  posted yet

#### Scenario: Thread has no replies

- **WHEN** a post's thread has no replies
- **THEN** the system SHALL display an empty-state card indicating there are no
  replies yet, instead of plain text

#### Scenario: Notifications list is empty

- **WHEN** the viewer has no notifications
- **THEN** the system SHALL display an empty-state card indicating there are no
  notifications yet, instead of plain text

#### Scenario: Profile or post lookup fails

- **WHEN** a requested profile or post does not exist
- **THEN** the system SHALL display an empty-state card indicating the resource was
  not found

### Requirement: Route-Shaped Loading Skeletons

The system SHALL display a loading skeleton matching the shape of a route's actual
content while that route's server-rendered data is being fetched.

#### Scenario: Navigating to a route with pending data

- **WHEN** the viewer navigates to `/`, `/posts/[id]`, `/profile/[username]`, or
  `/notifications` while data is still loading
- **THEN** Next.js SHALL render that route's `loading.tsx`, composed of skeleton
  shapes resembling the destination's eventual content (post cards, profile header,
  notification rows, etc.)

#### Scenario: Loading more items

- **WHEN** the viewer activates a "Load more" control on the feed, profile, or
  notifications list
- **THEN** the system SHALL show a skeleton placeholder for the incoming items while
  the request is pending, in addition to the existing pending button label

### Requirement: Persistent Navigation

The system SHALL display a persistent navigation bar with links to Home,
Notifications, and the viewer's Profile on every page where a viewer exists.

#### Scenario: Viewer exists

- **WHEN** a viewer is resolved for the current request
- **THEN** the system SHALL render a `<nav>` landmark containing links to `/`,
  `/notifications`, and `/profile/<viewer-username>`

#### Scenario: No viewer exists

- **WHEN** no viewer can be resolved (no users seeded)
- **THEN** the system SHALL NOT render the navigation bar

### Requirement: Responsive Layout

The system SHALL adapt page layout to the viewport width.

#### Scenario: Narrow viewport

- **WHEN** the viewport is narrower than the `sm` breakpoint
- **THEN** the navigation bar SHALL be fixed to the bottom of the viewport and page
  content SHALL reserve space below it

#### Scenario: Wide viewport

- **WHEN** the viewport is at the `sm` breakpoint or wider
- **THEN** the navigation bar SHALL be a sticky top bar, and page containers SHALL
  widen at the `md` breakpoint

### Requirement: Accessible Interactive Elements

The system SHALL provide visible keyboard focus indicators, accessible names and
states for icon-only controls, and live-region announcements for inline status
messages.

#### Scenario: Keyboard navigation

- **WHEN** a viewer tabs through interactive controls (buttons, links, the nav bar)
- **THEN** each focused control SHALL display a visible focus ring

#### Scenario: Toggling the like button

- **WHEN** a viewer activates the like control
- **THEN** the control SHALL expose its pressed state and an accessible name
  describing the action and current like count to assistive technology

#### Scenario: An action produces an inline error

- **WHEN** a server action (post/reply submission, follow/unfollow, like/unlike,
  load more) returns an error
- **THEN** the inline error message SHALL be announced to assistive technology via
  a live region

### Requirement: Shared Post/Reply Validation

The system SHALL validate post and reply body content using one shared function,
ensuring both share the same rules (non-empty after trimming, within the maximum
length) while preserving their distinct error wording.

#### Scenario: Empty or whitespace-only content

- **WHEN** a post or reply body is empty or contains only whitespace
- **THEN** the system SHALL reject it with a "cannot be empty" message naming the
  content type ("Post" or "Reply")

#### Scenario: Over-length content

- **WHEN** a post or reply body exceeds `MAX_POST_LENGTH` after trimming
- **THEN** the system SHALL reject it with a "must be N characters or fewer" message
  naming the content type

## Decisions

### 1. New non-domain feature directories: `src/features/ui/` and `src/features/nav/`

Following the feature-first convention, cross-cutting presentational primitives
(`EmptyState`, `Skeleton*`) live in `apps/main/src/features/ui/components/`, and the
navigation bar lives in `apps/main/src/features/nav/components/`. Neither needs
`@repo/types`/`@repo/api-client` exports — they're `@repo/main`-local.

### 2. `EmptyState` always renders `<h2>`

`apps/main/src/features/ui/components/empty-state.tsx`:

```tsx
type EmptyStateProps = {
  heading: string;
  description: React.ReactNode;
};

export function EmptyState({ heading, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-950">{heading}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
```

`description: React.ReactNode` (not `string`) so the "No users yet" copy, which
contains a `<code>bun run db:seed</code>` snippet, still works. The two
"not found" pages currently use `<h1>` for this card; downgrading to `<h2>` is
acceptable since neither page has any other heading.

### 3. Skeleton primitives compose route-shaped `loading.tsx` files

`apps/main/src/features/ui/components/skeleton.tsx` exports `SkeletonLine`,
`SkeletonCircle`, `SkeletonCard` (avatar + 2 header lines + 2 body lines, matching
`FeedItem`/`PostCard`), and `SkeletonNotificationRow` (avatar + 2 lines, matching
`NotificationItem`). Each route's `loading.tsx` composes these to roughly match that
route's real layout. "Load more" buttons render the same skeleton (wrapped in
`aria-hidden="true"`, since the button's own pending label already communicates
status to assistive technology) below the button while `isPending`.

### 4. Nav bar: emoji icons + visible labels, bottom-fixed on mobile, sticky-top on `sm:`

`apps/main/src/features/nav/components/nav-bar.tsx` is a server component taking
`viewer: ViewerUser | null` and rendering `null` if there's no viewer. One markup
tree handles both breakpoints via Tailwind responsive classes — `fixed bottom-0`
becomes `sm:sticky sm:top-0`. Emoji icons (🏠🔔👤) plus always-visible text labels
avoid adding an icon library dependency and keep every control fully accessible
without extra `aria-label`s.

### 5. Dedupe `getViewerUser` with React `cache()`

Adding `NavBar` to the root layout means `getViewerUser()` now runs once in
`layout.tsx` and again in every page. `packages/api-client/src/features/users/index.ts`
wraps the Prisma call in a module-scoped `cache()`:

```ts
const getCachedViewerUser = cache(
  (): Promise<ViewerUser | null> =>
    prisma.user.findFirst({
      /* ... */
    }),
);

export function createUsersClient() {
  return { getViewerUser: getCachedViewerUser };
}
```

Because the cached function is module-scoped, every `createUsersClient()` call
across `layout.tsx` and page files shares the same cache entry for the current
request.

### 6. `validatePostBody(body, kind, maxLength?)` preserves existing wording

`packages-types/src/features/posts/index.ts` gains:

```ts
export type ValidatePostBodyResult =
  | { trimmed: string; error?: undefined }
  | { trimmed?: undefined; error: string };

export function validatePostBody(
  body: string,
  kind: 'Post' | 'Reply' = 'Post',
  maxLength: number = MAX_POST_LENGTH,
): ValidatePostBodyResult {
  const trimmed = body.trim();

  if (trimmed.length === 0) {
    return { error: `${kind} cannot be empty.` };
  }

  if (trimmed.length > maxLength) {
    return { error: `${kind} must be ${maxLength} characters or fewer.` };
  }

  return { trimmed };
}
```

The `kind` parameter preserves the exact existing error text for both call sites —
no user-visible string changes — while removing the duplicated validation logic from
`createPostAction` and `createReplyAction`.

### 7. Vitest + React Testing Library, two configs

A root `vitest.config.ts` covers `packages-types` (pure functions, `node`
environment, no aliases needed). `apps/main/vitest.config.ts` covers server-action
tests and configures `jsdom` + `@vitejs/plugin-react` + the `@/*`/`@repo/*` path
aliases from `apps/main/tsconfig.json` as infrastructure for future component tests,
even though this pass's tests are DOM-free. Test files explicitly
`import { describe, it, expect, vi } from 'vitest'` (no `globals: true`), avoiding
ESLint config changes. `turbo.json` gains a `test` task mirroring `stylelint` (no
`dependsOn`); only `apps/main` and `packages-types` get a `test` script, since
Turbo skips workspaces without one.

## Risks / Trade-offs

- [Risk] `EmptyState` downgrades "Profile not found"/"Post not found" from `<h1>` to
  `<h2>` → Mitigation: neither page has any other heading, so `<h2>` remains the
  page's sole heading
- [Risk] Fixed bottom nav bar on mobile can overlap page content →
  Mitigation: `<body>` gets `pb-16 sm:pb-0` to reserve space below the fixed bar
- [Risk] `getViewerUser()` caching relies on module-instance sharing across import
  sites → Mitigation: standard Node/ESM module caching guarantees one module
  instance per process; `cache()` from `react` is designed for exactly this
  per-request-dedupe use case in Server Components
- [Risk] Installing `jsdom`/RTL now without using them yet adds unused
  devDependencies → Mitigation: minimal install cost, avoids a second
  config/dependency change when component tests are added later
