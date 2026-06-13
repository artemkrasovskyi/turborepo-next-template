export type ToggleFollowResult =
  | { isFollowing: boolean; error?: undefined }
  | { isFollowing?: undefined; error: string };
