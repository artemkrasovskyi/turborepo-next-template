## 1. Design Foundation

- [x] 1.1 Add `lucide-react` to `apps/main`
- [x] 1.2 Define Apple Web theme CSS variables in `globals.css` using semantic token names
- [x] 1.3 Update base body styles with system font, `--color-background`, `--color-text`, and antialiasing
- [x] 1.4 Update `.focus-ring` to use `--color-focus-ring`
- [x] 1.5 Add reusable app-level style helpers or lightweight UI primitives for surfaces, buttons, inputs, textareas, tabs, empty states, and skeletons
- [x] 1.6 Add reduced-motion-safe transition defaults using `prefers-reduced-motion`
- [x] 1.7 Verify design tokens provide readable contrast in each supported theme appearance

## 2. Navigation and App Shell

- [x] 2.1 Redesign authenticated navigation as a translucent sticky top bar on desktop
- [x] 2.2 Redesign mobile navigation as a bottom tab bar with safe-area padding
- [x] 2.3 Replace emoji nav symbols with Lucide icons
- [x] 2.4 Ensure signed-out auth pages remain free of authenticated navigation
- [x] 2.5 Normalize page containers and bottom padding so fixed mobile navigation does not cover content
- [x] 2.6 Add accessible names for icon controls and `aria-current="page"` for active navigation links where practical

## 3. Core Social Surfaces

- [x] 3.1 Restyle feed cards, post thread cards, reply composer, and post composer
- [x] 3.2 Restyle social action controls for reply, repost, like, and bookmark states
- [x] 3.3 Restyle post image grids and upload preview controls
- [x] 3.4 Restyle loading skeletons and empty states
- [x] 3.5 Preserve semantic structure for posts, forms, lists, dialogs, and status/error messages
- [x] 3.6 Ensure toggled controls expose state with `aria-pressed` or an equivalent accessible label

## 4. Route-Level UI

- [x] 4.1 Update home, explore, notifications, bookmarks, and post detail pages
- [x] 4.2 Update profile, profile tabs, followers/following, and liked-post pages
- [x] 4.3 Update direct-message inbox and conversation pages
- [x] 4.4 Update sign-in, sign-up, and error pages
- [x] 4.5 Check responsive behavior for mobile, tablet, and desktop widths

## 5. Verification

- [x] 5.1 Run `bun run typecheck`
- [x] 5.2 Run `bun run lint`
- [ ] 5.3 Run `bun run test`
- [ ] 5.4 Start the main app dev server
- [ ] 5.5 Visually verify token-based theme appearances on core routes
- [ ] 5.6 Verify core interactions still work: auth, create post, reply, like, repost, bookmark, follow, edit profile, send message, search, and pagination
- [ ] 5.7 Verify keyboard-only navigation across nav, feed actions, forms, tabs, and dialogs
- [ ] 5.8 Verify screen-reader labels for icon-only controls, form fields, error messages, loading states, and empty states
