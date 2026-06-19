import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_POST_LENGTH } from '@repo/types/features/posts';
import { createReplyAction } from './actions';

const { createReply } = vi.hoisted(() => ({
  createReply: vi.fn(),
}));

vi.mock('@repo/api-client/features/posts', () => ({
  createPostsClient: () => ({ createReply }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const AUTHOR_ID = 'user-1';
const PARENT_ID = 'post-1';

describe('createReplyAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects an empty body', async () => {
    const result = await createReplyAction(AUTHOR_ID, PARENT_ID, '');

    expect(result).toEqual({ error: 'Reply cannot be empty.' });
    expect(createReply).not.toHaveBeenCalled();
  });

  it('rejects a whitespace-only body', async () => {
    const result = await createReplyAction(AUTHOR_ID, PARENT_ID, '   ');

    expect(result).toEqual({ error: 'Reply cannot be empty.' });
    expect(createReply).not.toHaveBeenCalled();
  });

  it('rejects a body over the maximum length', async () => {
    const result = await createReplyAction(AUTHOR_ID, PARENT_ID, 'a'.repeat(MAX_POST_LENGTH + 1));

    expect(result).toEqual({ error: `Reply must be ${MAX_POST_LENGTH} characters or fewer.` });
    expect(createReply).not.toHaveBeenCalled();
  });

  it('creates a reply with the trimmed body', async () => {
    createReply.mockResolvedValue({ id: 'reply-1' });

    const result = await createReplyAction(AUTHOR_ID, PARENT_ID, '  hello world  ');

    expect(createReply).toHaveBeenCalledWith({
      authorId: AUTHOR_ID,
      parentId: PARENT_ID,
      body: 'hello world',
      imageUrls: [],
    });
    expect(revalidatePath).toHaveBeenCalledWith(`/posts/${PARENT_ID}`);
    expect(result).toEqual({ id: 'reply-1' });
  });
});
