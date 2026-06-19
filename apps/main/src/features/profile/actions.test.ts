import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_BIO_LENGTH, MAX_DISPLAY_NAME_LENGTH } from '@repo/types/features/profile';
import { updateProfileAction } from './actions';

const { updateProfile } = vi.hoisted(() => ({
  updateProfile: vi.fn(),
}));

vi.mock('@/features/auth/lib/viewer', () => ({
  getViewerUser: () => ({
    id: 'user-1',
    username: 'alice',
    displayName: 'Alice',
    avatarUrl: null,
  }),
}));

vi.mock('@repo/api-client/features/profile', () => ({
  createProfileClient: () => ({ updateProfile }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const USER_ID = 'user-1';
const USERNAME = 'alice';

describe('updateProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects an empty display name', async () => {
    const result = await updateProfileAction(USERNAME, '', null, null);

    expect(result).toEqual({ error: 'Display name cannot be empty.' });
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('rejects a display name over the maximum length', async () => {
    const result = await updateProfileAction(
      USERNAME,
      'a'.repeat(MAX_DISPLAY_NAME_LENGTH + 1),
      null,
      null,
    );

    expect(result).toEqual({
      error: `Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or fewer.`,
    });
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('rejects a bio over the maximum length', async () => {
    const result = await updateProfileAction(
      USERNAME,
      'Alice',
      'b'.repeat(MAX_BIO_LENGTH + 1),
      null,
    );

    expect(result).toEqual({ error: `Bio must be ${MAX_BIO_LENGTH} characters or fewer.` });
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('rejects a non-https avatar URL', async () => {
    const result = await updateProfileAction(
      USERNAME,
      'Alice',
      null,
      'http://example.com/avatar.png',
    );

    expect(result).toEqual({ error: 'Avatar URL must use HTTPS.' });
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('rejects an invalid avatar URL', async () => {
    const result = await updateProfileAction(USERNAME, 'Alice', null, 'not-a-url');

    expect(result).toEqual({ error: 'Avatar URL is not a valid URL.' });
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('updates profile with trimmed values and revalidates', async () => {
    updateProfile.mockResolvedValue({});

    const result = await updateProfileAction(
      USERNAME,
      '  Alice Smith  ',
      '  Bio text  ',
      'https://example.com/avatar.png',
    );

    expect(updateProfile).toHaveBeenCalledWith({
      userId: USER_ID,
      displayName: 'Alice Smith',
      bio: 'Bio text',
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(revalidatePath).toHaveBeenCalledWith(`/profile/${USERNAME}`);
    expect(result).toEqual({ ok: true });
  });

  it('treats whitespace-only bio as null', async () => {
    updateProfile.mockResolvedValue({});

    await updateProfileAction(USERNAME, 'Alice', '   ', null);

    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ bio: null }),
    );
  });

  it('treats empty avatar URL as null', async () => {
    updateProfile.mockResolvedValue({});

    await updateProfileAction(USERNAME, 'Alice', null, '  ');

    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ avatarUrl: null }),
    );
  });
});
