## Empty states

1. Create `EmptyState` component (`apps/main/src/features/ui/components/empty-state.tsx`)
2. Replace inline empty-state markup in `feed-list`, `profile-posts`, `app/page.tsx`,
   `posts/[id]/page.tsx`, `profile/[username]/page.tsx` with `<EmptyState>`
3. Convert plain-text "No replies yet." and "No notifications yet." to `<EmptyState>`

## Loading skeletons

4. Create `SkeletonLine`, `SkeletonCircle`, `SkeletonCard`, `SkeletonNotificationRow`
   (`apps/main/src/features/ui/components/skeleton.tsx`)
5. Refactor `app/loading.tsx` to compose from the new primitives
6. Add `app/posts/[id]/loading.tsx`
7. Add `app/profile/[username]/loading.tsx`
8. Add `app/notifications/loading.tsx`
9. Add pending-state skeletons to the 3 load-more buttons

## Responsive layout + nav bar

10. Wrap `getViewerUser` in React `cache()` (`packages/api-client/src/features/users`)
11. Create `NavBar` server component (`apps/main/src/features/nav/components/nav-bar.tsx`)
12. Convert `app/layout.tsx` to async; render `<NavBar viewer={viewer} />`; `pb-16 sm:pb-0` on body
13. Add `md:max-w-3xl` to all page `<main>` containers and all `loading.tsx` files
14. Remove the redundant "Notifications" link from `app/page.tsx` header

## Accessibility pass

15. Add `.focus-ring` utility to `apps/main/src/app/globals.css`
16. Apply `.focus-ring` to all interactive buttons/links lacking a focus style
17. Add `aria-pressed`, `aria-label`, `sr-only` text to `LikeButton` (both variants)
18. Add `role="status"` to all inline error `<p>` elements

## Tests

19. Extract `validatePostBody` into `packages-types/src/features/posts/index.ts`;
    update `createPostAction` and `createReplyAction` to use it
20. Add root `vitest.config.ts` and `apps/main/vitest.config.ts` (with path aliases + jsdom)
21. Add vitest + RTL devDependencies to root and `apps/main` `package.json`
22. Add `"test"` task to `turbo.json` and `"test"` scripts to root, `apps/main`, `packages-types`
23. Write `packages-types/src/features/posts/index.test.ts` (`validatePostBody` cases)
24. Write `apps/main/src/features/follow/actions.test.ts`
25. Write `apps/main/src/features/likes/actions.test.ts`
26. Write `apps/main/src/features/post-composer/actions.test.ts`
27. Write `apps/main/src/features/post-thread/actions.test.ts`
