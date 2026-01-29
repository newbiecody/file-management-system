export const FULL_MIME_TO_ABBREVIATED_MAP: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "image/gif": "GIF",
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PPTX",
  "text/plain": "TXT",
  "text/csv": "CSV",
  "application/json": "JSON",
} as const;

export type AbbreviatedFileType =
  (typeof FULL_MIME_TO_ABBREVIATED_MAP)[keyof typeof FULL_MIME_TO_ABBREVIATED_MAP];
