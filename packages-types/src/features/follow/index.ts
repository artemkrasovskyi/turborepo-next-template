export type ToggleFollowResult =
  | { isFollowing: boolean; error?: undefined }
  | { isFollowing?: undefined; error: string };

export type FollowListUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isFollowing: boolean;
};

export type FollowListPage = {
  items: FollowListUser[];
  nextCursor: string | null;
};
