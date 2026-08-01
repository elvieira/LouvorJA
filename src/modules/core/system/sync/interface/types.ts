export interface SyncAlbum {
  id_album: number | string;
  name: string;
  subtitle: string;
  coverUrl: string | null;
  rawCoverUrl?: string;
  status: "idle" | "downloading" | "downloaded" | "error";
  progress: number;
  totalCount: number;
  downloadedCount: number;
  isHymnal: boolean;
  progressText?: string;
  cancelToken?: boolean;
}

export interface SyncCategory {
  id_category: number | string;
  name: string;
  albums: SyncAlbum[];
}
