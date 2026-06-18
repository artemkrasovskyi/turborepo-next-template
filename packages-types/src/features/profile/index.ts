export type ProfileUser = {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
};

export const MAX_DISPLAY_NAME_LENGTH = 100;
export const MAX_BIO_LENGTH = 280;

export type UpdateProfileInput = {
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
};

export type ValidateProfileResult =
  | { error: string }
  | { error?: undefined; displayName: string; bio: string | null; avatarUrl: string | null };

export function validateProfileInput(input: UpdateProfileInput): ValidateProfileResult {
  const displayName = input.displayName.trim();
  if (displayName.length === 0) {
    return { error: 'Display name cannot be empty.' };
  }
  if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return { error: `Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or fewer.` };
  }

  const bio = input.bio === null || input.bio.trim().length === 0 ? null : input.bio.trim();
  if (bio !== null && bio.length > MAX_BIO_LENGTH) {
    return { error: `Bio must be ${MAX_BIO_LENGTH} characters or fewer.` };
  }

  const avatarUrl =
    input.avatarUrl === null || input.avatarUrl.trim().length === 0
      ? null
      : input.avatarUrl.trim();
  if (avatarUrl !== null) {
    try {
      const url = new URL(avatarUrl);
      if (url.protocol !== 'https:') {
        return { error: 'Avatar URL must use HTTPS.' };
      }
    } catch {
      return { error: 'Avatar URL is not a valid URL.' };
    }
  }

  return { displayName, bio, avatarUrl };
}
