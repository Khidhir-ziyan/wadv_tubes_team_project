import { useFetch } from './useFetch';
import { useApi } from './useApi';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types/api';

export const useProductService = () => {
  const { data: products, loading: productsLoading, error: productsError, refetch } =
    useFetch<Product[]>('/api/products');

  const createProduct = useApi<Product>('/api/products', { method: 'POST' });
  const updateProduct = useApi<Product>('/api/products', { method: 'PATCH' });
  const deleteProduct = useApi<void>('/api/products', { method: 'DELETE' });

  const softDeleteProduct = useApi<Product>('/api/products', { method: 'PATCH' });
  const restoreProduct = useApi<Product>('/api/products', { method: 'PATCH' });

  const searchProducts = useApi<Product[]>('/api/products/search', { method: 'GET' });

  const createProductHelper = async (productData: CreateProductRequest): Promise<Product | null> => {
    await createProduct.execute({ body: productData });
    if (!createProduct.error) {
      refetch();
    }
    return createProduct.data;
  };

  const updateProductHelper = async (id: number, updates: UpdateProductRequest): Promise<Product | null> => {
    try {
      const API_BASE_URL = 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        refetch();
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteProductHelper = async (id: number): Promise<void> => {
    try {
      const API_BASE_URL = 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        refetch();
      } else {
        throw new Error(result.message || 'Failed to delete product');
      }
    } catch (error) {
      throw error;
    }
  };

  const softDeleteProductHelper = async (id: number): Promise<Product | null> => {
    await softDeleteProduct.execute({
      body: {},
      headers: { 'Content-Type': 'application/json' }
    });
    if (!softDeleteProduct.error) {
      refetch();
    }
    return softDeleteProduct.data;
  };

  const restoreProductHelper = async (id: number): Promise<Product | null> => {
    await restoreProduct.execute({
      body: {},
      headers: { 'Content-Type': 'application/json' }
    });
    if (!restoreProduct.error) {
      refetch();
    }
    return restoreProduct.data;
  };

  const searchProductsHelper = async (query: string): Promise<Product[]> => {
    await searchProducts.execute();
    return searchProducts.data || [];
  };

  return {
    products,
    productsLoading,
    productsError,
    refetchProducts: refetch,

    createProduct: createProductHelper,
    createLoading: createProduct.loading,
    createError: createProduct.error,

    updateProduct: updateProductHelper,
    updateLoading: false,
    updateError: null,

    deleteProduct: deleteProductHelper,
    deleteLoading: false,
    deleteError: null,

    softDeleteProduct: softDeleteProductHelper,
    softDeleteLoading: softDeleteProduct.loading,
    softDeleteError: softDeleteProduct.error,

    restoreProduct: restoreProductHelper,
    restoreLoading: restoreProduct.loading,
    restoreError: restoreProduct.error,

    searchProducts: searchProductsHelper,
    searchLoading: searchProducts.loading,
    searchError: searchProducts.error
  };
};