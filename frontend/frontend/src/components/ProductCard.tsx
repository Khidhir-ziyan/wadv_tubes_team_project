import React, { useState } from 'react';
import type { Product } from '../types/api';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`product-card ${product.is_deleted ? 'deleted' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-content">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          <span className={`category-badge ${product.category.toLowerCase()}`}>
            {product.category}
          </span>
        </div>

        <p className="product-price">{formatPrice(product.price)}</p>

        <p className="product-description">
          {product.description.length > 100
            ? `${product.description.substring(0, 100)}...`
            : product.description
          }
        </p>

        <div className="product-meta">
          <small>Created: {formatDate(product.created_at)}</small>
          {product.updated_at !== product.created_at && (
            <small>Updated: {formatDate(product.updated_at)}</small>
          )}
          {product.is_deleted && product.deleted_at && (
            <small className="deleted-info">Deleted: {formatDate(product.deleted_at)}</small>
          )}
        </div>
      </div>

      {/* Action buttons appear on hover */}
      <div className="card-actions">
        <button
          onClick={onEdit}
          className="edit-button"
          disabled={product.is_deleted}
          title="Edit product"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          className="delete-button"
          title="Delete product"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};