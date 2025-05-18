/**
 * UUID type definition
 */
export type UUID = string;

/**
 * ISO date string format
 */
export type ISODateString = string;

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
} 