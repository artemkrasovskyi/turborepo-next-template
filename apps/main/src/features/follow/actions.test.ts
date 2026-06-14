import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toggleFollowAction } from './actions';

const { follow, unfollow, notifyFollow } = vi.hoisted(() => ({
  follow: vi.fn(),
  unfollow: vi.fn(),
  notifyFollow: vi.fn(),
}));

vi.mock('@repo/api-client/features/follow', () => ({
  createFollowClient: () => ({ follow, unfollow }),
}));

vi.mock('@repo/api-client/features/notifications', () => ({
  createNotificationsClient: () => ({ notifyFollow }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const FOLLOWER_ID = 'user-1';
const FOLLOWING_ID = 'user-2';

describe('toggleFollowAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects following yourself', async () => {
    const result = await toggleFollowAction(FOLLOWER_ID, FOLLOWER_ID, true);

    expect(result).toEqual({ error: 'You cannot follow yourself.' });
    expect(follow).not.toHaveBeenCalled();
    expect(unfollow).not.toHaveBeenCalled();
    expect(notifyFollow).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('follows and notifies when a new follow is created', async () => {
    follow.mockResolvedValue({ created: true });

    const result = await toggleFollowAction(FOLLOWER_ID, FOLLOWING_ID, true);

    expect(follow).toHaveBeenCalledWith({ followerId: FOLLOWER_ID, followingId: FOLLOWING_ID });
    expect(notifyFollow).toHaveBeenCalledWith({
      recipientId: FOLLOWING_ID,
      actorId: FOLLOWER_ID,
    });
    expect(revalidatePath).toHaveBeenCalled();
    expect(result).toEqual({ isFollowing: true });
  });

  it('does not notify when the follow already existed', async () => {
    follow.mockResolvedValue({ created: false });

    await toggleFollowAction(FOLLOWER_ID, FOLLOWING_ID, true);

    expect(notifyFollow).not.toHaveBeenCalled();
  });

  it('unfollows without notifying', async () => {
    const result = await toggleFollowAction(FOLLOWER_ID, FOLLOWING_ID, false);

    expect(unfollow).toHaveBeenCalledWith({ followerId: FOLLOWER_ID, followingId: FOLLOWING_ID });
    expect(notifyFollow).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalled();
    expect(result).toEqual({ isFollowing: false });
  });
});
