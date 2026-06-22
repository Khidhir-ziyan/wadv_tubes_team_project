import React from 'react';
import type { Product } from '../types/api';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRefresh: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  error,
  onEdit,
  onDelete,
  onRefresh
}) => {
  if (error) {
    return (
      <div className="error-state">
        <div className="error-content">
          <h3>Failed to load products</h3>
          <p>{error}</p>
          <button onClick={onRefresh} className="retry-button">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-content">
          <h3>No products found</h3>
          <p>Get started by creating your first product.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="list-header">
        <h2>Products ({products.length})</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="refresh-button"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="product-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => onEdit(product)}
            onDelete={() => onDelete(product)}
          />
        ))}
      </div>
    </div>
  );
};