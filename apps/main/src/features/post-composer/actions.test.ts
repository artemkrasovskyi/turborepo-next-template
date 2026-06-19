import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_POST_LENGTH } from '@repo/types/features/posts';
import { createPostAction } from './actions';

const { createPost } = vi.hoisted(() => ({
  createPost: vi.fn(),
}));

vi.mock('@repo/api-client/features/posts', () => ({
  createPostsClient: () => ({ createPost }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const AUTHOR_ID = 'user-1';

describe('createPostAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects an empty body', async () => {
    const result = await createPostAction(AUTHOR_ID, '');

    expect(result).toEqual({ error: 'Post cannot be empty.' });
    expect(createPost).not.toHaveBeenCalled();
  });

  it('rejects a whitespace-only body', async () => {
    const result = await createPostAction(AUTHOR_ID, '   ');

    expect(result).toEqual({ error: 'Post cannot be empty.' });
    expect(createPost).not.toHaveBeenCalled();
  });

  it('rejects a body over the maximum length', async () => {
    const result = await createPostAction(AUTHOR_ID, 'a'.repeat(MAX_POST_LENGTH + 1));

    expect(result).toEqual({ error: `Post must be ${MAX_POST_LENGTH} characters or fewer.` });
    expect(createPost).not.toHaveBeenCalled();
  });

  it('creates a post with the trimmed body', async () => {
    createPost.mockResolvedValue({ id: 'post-1' });

    const result = await createPostAction(AUTHOR_ID, '  hello world  ');

    expect(createPost).toHaveBeenCalledWith({ authorId: AUTHOR_ID, body: 'hello world', imageUrls: [] });
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(result).toEqual({ id: 'post-1' });
  });
});
