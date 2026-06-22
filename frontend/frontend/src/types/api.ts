export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
  deleted_at?: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  description: string;
  category: string;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BulkDeleteRequest {
  ids: number[];
}

export interface BulkDeleteResponse {
  successful: number[];
  failed: Array<{
    id: number;
    error: string;
  }>;
  summary: {
    total: number;
    successful_count: number;
    failed_count: number;
  };
}

export interface ProductFormData {
  name: string;
  price: string;
  description: string;
  category: string;
}

export interface FormErrors {
  name?: string;
  price?: string;
  description?: string;
  category?: string;
  general?: string;
}

export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ApiHookConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  enabled?: boolean;
}

export interface ApiHookResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (config?: Partial<ApiHookConfig>) => Promise<void>;
  reset: () => void;
}