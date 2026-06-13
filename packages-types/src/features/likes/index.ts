export type ToggleLikeResult =
  | { isLiked: boolean; error?: undefined }
  | { isLiked?: undefined; error: string };
