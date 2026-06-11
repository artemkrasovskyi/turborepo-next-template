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
};

export type FeedPage = {
  items: FeedPost[];
  nextCursor: string | null;
};
