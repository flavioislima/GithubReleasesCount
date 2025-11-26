export interface GitHubAsset {
  id: number;
  name: string;
  download_count: number;
  browser_download_url: string;
  created_at: string;
  updated_at: string;
  size: number;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  assets: GitHubAsset[];
}

export interface AssetDownloadData {
  name: string;
  downloadCount: number;
  extension: string;
  date: string;
  releaseName: string;
}

export interface ExtensionStats {
  extension: string;
  count: number;
  totalDownloads: number;
}

export interface TimeRangeData {
  date: string;
  downloads: number;
}
