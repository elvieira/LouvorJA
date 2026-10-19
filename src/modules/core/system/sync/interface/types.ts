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
  categoryId?: string | number;
  categoryName?: string;
  trackCount?: number;
  year?: string | number;
  sizeBytes?: number;
  formattedSize?: string;
  addedAt?: string;
  updatedAt?: string;
  folderPath?: string;
}

export interface SyncCategory {
  id_category: number | string;
  name: string;
  icon?: string;
  albums: SyncAlbum[];
}
