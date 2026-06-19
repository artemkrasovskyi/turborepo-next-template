import { describe, expect, it } from 'vitest';
import { scoreRecommendedPost, scoreSuggestedUser } from './index';

describe('scoreSuggestedUser', () => {
  it('ranks by social proximity first for typical values', () => {
    // 1 mutual-followed-by (100pts) beats 30 followers (90pts)
    const highProximity = scoreSuggestedUser(1, 0, 0, 365);
    const highFollowers = scoreSuggestedUser(0, 30, 0, 365);
    expect(highProximity).toBeGreaterThan(highFollowers);
  });

  it('gives a recency boost to accounts joined within 30 days', () => {
    const newAccount = scoreSuggestedUser(0, 0, 0, 0);
    const oldAccount = scoreSuggestedUser(0, 0, 0, 365);
    expect(newAccount).toBeGreaterThan(oldAccount);
  });

  it('gives no recency boost to accounts older than 30 days', () => {
    const thirtyOneDays = scoreSuggestedUser(0, 0, 0, 31);
    const oneYear = scoreSuggestedUser(0, 0, 0, 365);
    expect(thirtyOneDays).toEqual(oneYear);
  });

  it('factors in follower count and recent posts', () => {
    const withFollowers = scoreSuggestedUser(0, 10, 0, 365);
    const withPosts = scoreSuggestedUser(0, 0, 10, 365);
    const baseline = scoreSuggestedUser(0, 0, 0, 365);
    expect(withFollowers).toBeGreaterThan(baseline);
    expect(withPosts).toBeGreaterThan(baseline);
  });

  it('orders two users correctly by score', () => {
    // 2 mutual (200pts) + 5 posts (25pts) = 225 > 50 followers (150pts)
    const user1 = scoreSuggestedUser(2, 0, 5, 365);
    const user2 = scoreSuggestedUser(0, 50, 0, 365);
    expect(user1).toBeGreaterThan(user2);
  });
});

describe('scoreRecommendedPost', () => {
  it('ranks by followed-user engagement first for typical values', () => {
    // 1 followed engagement (80pts) beats 15 likes (60pts)
    const highEngagement = scoreRecommendedPost(1, 0, 0, 0, 0, 365);
    const highLikes = scoreRecommendedPost(0, 0, 15, 0, 0, 365);
    expect(highEngagement).toBeGreaterThan(highLikes);
  });

  it('gives a recency boost to posts within 7 days', () => {
    const freshPost = scoreRecommendedPost(0, 0, 0, 0, 0, 0);
    const oldPost = scoreRecommendedPost(0, 0, 0, 0, 0, 365);
    expect(freshPost).toBeGreaterThan(oldPost);
  });

  it('gives no recency boost to posts older than 7 days', () => {
    const eightDays = scoreRecommendedPost(0, 0, 0, 0, 0, 8);
    const oneYear = scoreRecommendedPost(0, 0, 0, 0, 0, 365);
    expect(eightDays).toEqual(oneYear);
  });

  it('weights reposts higher than likes per unit', () => {
    const oneRepost = scoreRecommendedPost(0, 0, 0, 1, 0, 365);
    const oneLike = scoreRecommendedPost(0, 0, 1, 0, 0, 365);
    expect(oneRepost).toBeGreaterThan(oneLike);
  });

  it('factors in author social proximity', () => {
    const proximate = scoreRecommendedPost(0, 1, 0, 0, 0, 365);
    const baseline = scoreRecommendedPost(0, 0, 0, 0, 0, 365);
    expect(proximate).toBeGreaterThan(baseline);
  });
});
