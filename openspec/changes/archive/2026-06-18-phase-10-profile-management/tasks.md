## 1. Types

- [x] 1.1 Add `UpdateProfileInput` type to `packages-types/src/features/profile/index.ts` — `{ userId: string; displayName: string; bio: string | null; avatarUrl: string | null }`
- [x] 1.2 Add `validateProfileInput(input)` utility to `packages-types/src/features/profile/index.ts` — validates display name (non-empty, ≤100 chars), bio (optional, ≤280 chars), avatarUrl (optional, valid `https://` URL or null)

## 2. API Client

- [x] 2.1 Add `updateProfile({ userId, displayName, bio, avatarUrl })` method to `createProfileClient()` in `packages/api-client/src/features/profile/index.ts` — calls `prisma.user.update` and returns the updated `ProfileUser`

## 3. Server Action

- [x] 3.1 Create `updateProfileAction` in `apps/main/src/features/profile/actions.ts` — validates input with `validateProfileInput`, calls `profileClient.updateProfile`, revalidates `/profile/<username>`, returns `{ error }` or `{ ok: true }`
- [x] 3.2 Add unit tests for `updateProfileAction` in `apps/main/src/features/profile/actions.test.ts` — covers empty display name, bio over max length, invalid avatar URL, and valid submission

## 4. Edit Profile Form Component

- [x] 4.1 Create `EditProfileForm` Client Component at `apps/main/src/features/profile/components/edit-profile-form.tsx` — fields for display name, bio (textarea), avatar URL; character counters on bio; submit/cancel buttons; inline error display; calls `updateProfileAction` on submit
- [x] 4.2 Create `EditProfileButton` Client Component at `apps/main/src/features/profile/components/edit-profile-button.tsx` — button that toggles `EditProfileForm` open/closed; when form is open it replaces the button

## 5. Profile Header — Own Profile View

- [x] 5.1 Add `isOwnProfile: boolean` prop to `ProfileHeader` in `apps/main/src/features/profile/components/profile-header.tsx`
- [x] 5.2 Render `EditProfileButton` (with current profile values pre-populated) instead of `FollowButton` when `isOwnProfile` is true
- [x] 5.3 Render `<img src={profile.avatarUrl} />` in the avatar slot when `avatarUrl` is set, falling back to initials when null

## 6. Profile Page — Wire Up Own Profile

- [x] 6.1 Pass `isOwnProfile={viewer?.id === profile.id}` to `ProfileHeader` in `apps/main/src/app/profile/[username]/page.tsx`
