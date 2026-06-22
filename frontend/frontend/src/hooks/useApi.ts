import { useState } from 'react';
import type { ApiHookConfig, ApiHookResult, ApiResponse } from '../types/api';

const API_BASE_URL = 'http://localhost:8000';

export function useApi<T>(
  endpoint: string,
  initialConfig: ApiHookConfig = {}
): ApiHookResult<T> {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null
  });

  const execute = async (overrideConfig: Partial<ApiHookConfig> = {}): Promise<void> => {
    const config = { ...initialConfig, ...overrideConfig };

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: config.body ? JSON.stringify(config.body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      if (response.status === 204) {
        setState({ data: null as T, loading: false, error: null });
      } else {
        const result: ApiResponse<T> = await response.json();

        if (result.success) {
          setState({ data: result.data, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: result.message });
        }
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  return { ...state, execute, reset };
}

export const useCreateProduct = () => useApi('/api/products', { method: 'POST' });

export const useUpdateProduct = (id: number) => useApi(`/api/products/${id}`, { method: 'PATCH' });

export const useDeleteProduct = (id: number) => useApi(`/api/products/${id}`, { method: 'DELETE' });

export const useSoftDeleteProduct = (id: number) => useApi(`/api/products/${id}/soft-delete`, { method: 'PATCH' });

export const useRestoreProduct = (id: number) => useApi(`/api/products/${id}/restore`, { method: 'PATCH' });