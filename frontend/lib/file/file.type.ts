import { PaginationState } from "../api.type";

export interface FileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  checksum?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FileUploadResult {
  data: {
    success: boolean;
    message: string;
    file: FileMetadata;
  }[];
}

export interface FileRetrievalResult extends PaginationState {
  data: FileMetadata[];
}
