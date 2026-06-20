## Context

Flock currently uses a small Tailwind-only UI with repeated hard-coded utility color styles, emoji navigation icons, and mostly page-local class names. The experience is functional, but it does not yet have a coherent design system or a polished native-feeling visual language.

Phase 18 redesigns the existing app UI to an Apple-inspired web interface. The redesign is visual and interaction-focused: it keeps current routes, data models, auth behavior, server actions, and feature scope intact while introducing shared styling foundations and consistent component treatments.

## Goals / Non-Goals

**Goals:**
- Apply an Apple Web design direction across the whole main app
- Add light and dark appearances using system preference support
- Replace hard-coded accent colors with semantic accent tokens for primary actions, selected states, focus, and links
- Replace emoji and text-like symbols with consistent outline icons
- Make navigation feel polished on desktop and mobile
- Standardize cards, forms, buttons, tabs, empty states, skeletons, and post/media surfaces
- Preserve comfortable social-app density with touch-friendly controls
- Preserve and improve accessibility for keyboard, screen reader, reduced-motion, and contrast needs
- Keep all current product behavior and route boundaries unchanged

**Non-Goals:**
- Native iOS or macOS clone
- New marketing landing page
- Backend, Prisma, auth, or API contract changes
- New social features
- Route restructuring
- Full component library extraction outside `apps/main`
- Animation-heavy redesign
- Replacing semantic HTML with custom widgets where native elements work

## Decisions

### Apple Web visual language

Use an Apple-inspired web style rather than copying a native platform exactly:
- system font stack
- clean typography hierarchy
- adaptive theme surfaces
- restrained separators and shadows
- translucent navigation with backdrop blur
- semantic primary accent tokens
- generous but not oversized spacing

The UI should continue to feel like a web social app, not a marketing page or device mockup.

### Accessibility is part of the design system

Treat accessibility as a required design constraint, not a final QA pass:
- keep semantic landmarks, headings, forms, links, and buttons
- preserve visible focus states for all keyboard-reachable controls
- ensure icon-only controls have accessible names
- indicate selected/toggled/current states with ARIA where appropriate
- preserve readable contrast in each supported theme appearance
- respect `prefers-reduced-motion`
- keep touch targets comfortable on mobile

Use native controls wherever possible. Add ARIA only when it communicates state or labels that native HTML cannot provide on its own.

### CSS variables define the design tokens

Add the base design system in `apps/main/src/app/globals.css`:
- `--color-background`
- `--color-surface`
- `--color-surface-elevated`
- `--color-text`
- `--color-text-muted`
- `--color-border`
- `--color-separator`
- `--color-accent`
- `--color-accent-hover`
- `--color-accent-foreground`
- `--color-danger`
- `--color-danger-foreground`
- `--color-focus-ring`
- `--color-skeleton`
- `--color-disabled`

Use `prefers-color-scheme: dark` for dark appearance. Tailwind utility classes may reference CSS variables directly with arbitrary values where useful.

Interactive token choices must support visible focus outlines and readable foreground/background contrast in each supported theme appearance.

### Shared styling lives inside the main app

Keep the redesign local to `apps/main`. Add small shared UI helpers/components only when they remove repeated visual decisions across screens. Do not move UI foundations into workspace packages unless another app starts consuming them.

Prioritize these shared primitives:
- button styles
- form control styles
- surface/card styles
- app page container style
- skeleton and empty-state styles

### Icons use Lucide React

Add `lucide-react` to `apps/main` and use it for navigation and action icons. Replace emoji navigation symbols with accessible icon+label controls. Use icons for common social actions such as home, search, notifications, messages, bookmarks, profile, sign out, image upload, reply, repost, like, and close/remove where practical.

### Navigation adapts by viewport

Desktop navigation should be a sticky top bar with translucent material, blur, subtle separator, and compact icon+label links.

Mobile navigation should remain a fixed bottom tab bar with safe-area padding. It should use icon-first controls, preserve readable labels, and avoid covering content.

Signed-out auth pages should not render the authenticated nav.

Navigation should expose the active route with `aria-current="page"` where the route can be determined without introducing client-only routing state.

### Whole app migration

Apply the redesign to all user-facing surfaces in one pass:
- home feed and post composer
- feed cards and post detail thread
- explore/search and recommendation surfaces
- profile, profile tabs, followers/following, likes
- notifications
- bookmarks
- messages and conversation view
- sign-in and sign-up
- loading, empty, and error states

## Risks / Trade-offs

- **Broad visual diff:** Updating the whole app at once creates a large UI diff, but it avoids mixed old/new visual states across routes.
- **Tailwind repetition remains possible:** Without a large component library, some class repetition will remain. Shared helpers should cover repeated decisions without over-abstracting.
- **Icon dependency:** Adding `lucide-react` increases dependency surface, but it gives consistent accessible icons and avoids handcrafted SVG churn.
- **Dark mode quality:** Dark mode must be verified visually because CSS variables can create contrast issues if applied inconsistently.
- **Accessibility regression risk:** Large visual rewrites can break labels, focus order, or contrast. The implementation must verify keyboard navigation, accessible names, and state announcements on representative routes.
