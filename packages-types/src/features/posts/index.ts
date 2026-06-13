export const MAX_POST_LENGTH = 280;

export type CreatePostInput = {
  authorId: string;
  body: string;
};

export type PostAuthor = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type ThreadPost = {
  id: string;
  body: string;
  createdAt: string;
  author: PostAuthor;
};

export type ThreadPage = {
  root: ThreadPost;
  replies: ThreadPost[];
};

export type CreateReplyInput = {
  authorId: string;
  parentId: string;
  body: string;
};
