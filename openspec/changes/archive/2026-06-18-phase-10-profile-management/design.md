## Context

The profile read path (`/profile/[username]`) is fully implemented — `ProfileHeader` displays display name, username, bio, avatar initials, follower/following counts, and a follow button. The `User` model already has `displayName`, `bio`, and `avatarUrl` fields; no schema migration is needed for text edits. What's missing is any write path: no edit form, no update action, no API client mutation.

Auth is not yet implemented. The viewer identity comes from a seeded demo user via `usersClient.getViewerUser()`. The "own profile" condition is `viewerId === profile.id`.

## Goals / Non-Goals

**Goals:**
- Let the viewer edit their own profile (display name, bio, avatar URL) from the profile page
- Validate display name (non-empty), bio (optional), avatar URL (optional, must be a valid URL or empty)
- Persist changes via a Server Action and reflect them without full page reload
- Show the edit form only when the viewer is viewing their own profile
- Replace the Follow button with an Edit Profile button on the viewer's own profile

**Non-Goals:**
- Username changes (usernames are immutable in MVP)
- File-based avatar upload (no storage backend; a URL field covers MVP — add Uploadthing/S3 later)
- Password / credential management (no auth in MVP)
- Account deletion

## Decisions

### Inline edit form, not a separate route
The edit UI is an inline form that replaces the `ProfileHeader` content when active, toggled by an "Edit profile" button. This avoids a new route, keeps context visible, and matches the pattern used by `ReplyComposer` (toggle in-place, not navigate away).

Alternative considered: `/settings/profile` page. Rejected — adds a route and nav entry for a form that maps 1:1 to content already on the profile page.

### Avatar as URL input, not file upload
`avatarUrl: String?` is already on the schema. The app currently falls back to initials when `avatarUrl` is null. Accepting a URL string requires zero new infrastructure. File upload would need a storage bucket and a presigned URL flow — out of scope for MVP.

The `ProfileHeader` avatar already has a branch: if `avatarUrl` is set, render `<img>`; otherwise render initials. Implementing this branch (currently only initials) is part of this phase.

### `updateProfile` mutation added to `createProfileClient()`
Keeps the existing client factory pattern. Accepts `{ userId, displayName, bio, avatarUrl }`, runs `prisma.user.update`, returns the updated `ProfileUser`. No new package or export needed — `@repo/api-client/features/profile` already exported.

### Validation in a shared `validateProfileInput` utility in `@repo/types`
`displayName` must be non-empty and within a max length (100 chars). `bio` is optional, max 280 chars. `avatarUrl` is optional; if provided, must parse as a valid `https://` URL. Centralising validation in types keeps the server action thin and makes it testable.

### `EditProfileForm` is a Client Component; `ProfileHeader` stays a Server Component
`ProfileHeader` receives `isOwnProfile: boolean` and renders either `FollowButton` or an `<EditProfileButton>` (a small client wrapper that toggles the form). `EditProfileForm` holds the form state and calls `updateProfileAction`. On success, the Server Action revalidates `/profile/<username>` to refresh the RSC tree.

## Risks / Trade-offs

- **URL-only avatars** → Users must host images themselves or paste a CDN URL. Acceptable for demo/MVP; real users expect file upload. The `avatarUrl` rendering branch is already stubbed for when file upload lands.
- **`revalidatePath` flash on save** → Same trade-off as reply submission. The loading skeleton (`loading.tsx`) covers it.
- **No optimistic update on display name change** → The header flashes the old name briefly after submit. Acceptable for MVP.
