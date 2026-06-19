export type ToggleRepostResult =
  | { isReposted: boolean; error?: undefined }
  | { isReposted?: undefined; error: string };
