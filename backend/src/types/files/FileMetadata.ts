export type FileMetadataStatus = "ACTIVE" | "SOFT_DELETED" | "DELETED";

export interface FileMetadata {
  parentId?: number | null;
  id: number;
  name: string;
  size: number | null;
  mimetype: string | null;
  objectType: "FILE" | "FOLDER";
  storageKey?: string;
  createdAt: string;
  updatedAt?: string;
  status?: FileMetadataStatus;
}
