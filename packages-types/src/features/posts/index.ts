export const MAX_POST_LENGTH = 280;

export type ValidatePostBodyResult =
  | { trimmed: string; error?: undefined }
  | { trimmed?: undefined; error: string };

export function validatePostBody(
  body: string,
  kind: 'Post' | 'Reply' = 'Post',
  maxLength: number = MAX_POST_LENGTH,
): ValidatePostBodyResult {
  const trimmed = body.trim();

  if (trimmed.length === 0) {
    return { error: `${kind} cannot be empty.` };
  }

  if (trimmed.length > maxLength) {
    return { error: `${kind} must be ${maxLength} characters or fewer.` };
  }

  return { trimmed };
}

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
  likeCount: number;
  isLikedByViewer: boolean;
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
