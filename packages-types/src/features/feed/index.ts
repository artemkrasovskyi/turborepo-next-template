import type { PostImage } from '../posts';

export type FeedAuthor = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type FeedPost = {
  id: string;
  body: string;
  createdAt: string;
  author: FeedAuthor;
  replyCount: number;
  likeCount: number;
  isLikedByViewer: boolean;
  repostCount: number;
  isRepostedByViewer: boolean;
  repostedBy?: FeedAuthor;
  isBookmarkedByViewer: boolean;
  images: PostImage[];
};

export type FeedPage = {
  items: FeedPost[];
  nextCursor: string | null;
};
