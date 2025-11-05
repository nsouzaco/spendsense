export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId?: string;
  latency?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterParams {
  persona?: string[];
  incomeMin?: number;
  incomeMax?: number;
  creditUtilMin?: number;
  creditUtilMax?: number;
  hasConsent?: boolean;
}

export interface SearchParams {
  query?: string;
  fields?: string[];
}

