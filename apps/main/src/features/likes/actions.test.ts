import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toggleLikeAction } from './actions';

const { like, unlike, notifyLike } = vi.hoisted(() => ({
  like: vi.fn(),
  unlike: vi.fn(),
  notifyLike: vi.fn(),
}));

vi.mock('@repo/api-client/features/likes', () => ({
  createLikesClient: () => ({ like, unlike }),
}));

vi.mock('@repo/api-client/features/notifications', () => ({
  createNotificationsClient: () => ({ notifyLike }),
}));

const USER_ID = 'user-1';
const POST_ID = 'post-1';

describe('toggleLikeAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('likes and notifies when a new like is created', async () => {
    like.mockResolvedValue({ created: true });

    const result = await toggleLikeAction(USER_ID, POST_ID, true);

    expect(like).toHaveBeenCalledWith({ userId: USER_ID, postId: POST_ID });
    expect(notifyLike).toHaveBeenCalledWith({ actorId: USER_ID, postId: POST_ID });
    expect(result).toEqual({ isLiked: true });
  });

  it('does not notify when the like already existed', async () => {
    like.mockResolvedValue({ created: false });

    await toggleLikeAction(USER_ID, POST_ID, true);

    expect(notifyLike).not.toHaveBeenCalled();
  });

  it('unlikes without notifying', async () => {
    const result = await toggleLikeAction(USER_ID, POST_ID, false);

    expect(unlike).toHaveBeenCalledWith({ userId: USER_ID, postId: POST_ID });
    expect(notifyLike).not.toHaveBeenCalled();
    expect(result).toEqual({ isLiked: false });
  });
});
