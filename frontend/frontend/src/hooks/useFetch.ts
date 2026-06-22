import { useState, useEffect } from 'react';
import type { FetchState, ApiResponse } from '../types/api';

const API_BASE_URL = 'http://localhost:8000';

export function useFetch<T>(url: string, options?: {
  enabled?: boolean;
  refetchInterval?: number;
}): FetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`${API_BASE_URL}${url}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (result.success) {
        setState({ data: result.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: result.message });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  useEffect(() => {
    if (options?.enabled !== false) {
      fetchData();
    }
  }, [url, options?.enabled]);

  useEffect(() => {
    if (options?.refetchInterval && options?.enabled !== false) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [options?.refetchInterval, options?.enabled]);

  return {
    ...state,
    refetch: fetchData
  };
}