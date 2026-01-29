export interface PaginationState {
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
  totalPages: number;
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}
