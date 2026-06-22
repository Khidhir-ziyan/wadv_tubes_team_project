import React from 'react';
import type { Product, CreateProductRequest } from '../types/api';
import { useProductForm } from '../hooks/useProductForm';
import { useProductService } from '../hooks/useProductService';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const isEdit = !!product;

  const initialData = product ? {
    name: product.name,
    price: product.price.toString(),
    description: product.description,
    category: product.category
  } : undefined;

  const { formState, updateField, transformToApiPayload, validate, setSubmitting, setError, reset } =
    useProductForm(initialData);

  const { createProduct, updateProduct, createLoading, updateLoading, createError, updateError } =
    useProductService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = transformToApiPayload(formState.data);

      if (isEdit && product) {
        await updateProduct(product.id, payload);
        onSuccess();
      } else {
        await createProduct(payload);
        if (!createError) {
          onSuccess();
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = createLoading || updateLoading;
  const error = createError || updateError;

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-header">
        <h2>{isEdit ? 'Edit Product' : 'Create New Product'}</h2>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="error-banner">
          ❌ {error}
        </div>
      )}

      {formState.errors.general && (
        <div className="error-banner">
          ❌ {formState.errors.general}
        </div>
      )}

      {/* Form Fields */}
      <div className="form-field">
        <label htmlFor="name">Product Name *</label>
        <input
          id="name"
          type="text"
          value={formState.data.name}
          onChange={(e) => updateField('name', e.target.value)}
          className={formState.errors.name ? 'error' : ''}
          disabled={isLoading}
          placeholder="Enter product name (min 3 characters)"
        />
        {formState.errors.name && (
          <span className="field-error">{formState.errors.name}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="price">Price *</label>
        <input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={formState.data.price}
          onChange={(e) => updateField('price', e.target.value)}
          className={formState.errors.price ? 'error' : ''}
          disabled={isLoading}
          placeholder="Enter price"
        />
        {formState.errors.price && (
          <span className="field-error">{formState.errors.price}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="category">Category *</label>
        <select
          id="category"
          value={formState.data.category}
          onChange={(e) => updateField('category', e.target.value)}
          className={formState.errors.category ? 'error' : ''}
          disabled={isLoading}
        >
          <option value="">Select a category</option>
          <option value="Laptops">Laptops</option>
          <option value="Smartphones">Smartphones</option>
          <option value="Tablets">Tablets</option>
          <option value="Audio">Audio</option>
          <option value="Electronics">Electronics</option>
          <option value="Accessories">Accessories</option>
          <option value="Gaming">Gaming</option>
          <option value="Other">Other</option>
        </select>
        {formState.errors.category && (
          <span className="field-error">{formState.errors.category}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={formState.data.description}
          onChange={(e) => updateField('description', e.target.value)}
          className={formState.errors.description ? 'error' : ''}
          disabled={isLoading}
          placeholder="Enter product description (min 10 characters)"
          rows={4}
        />
        {formState.errors.description && (
          <span className="field-error">{formState.errors.description}</span>
        )}
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="cancel-button"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !formState.isValid}
          className="submit-button"
        >
          {isLoading ? (
            isEdit ? 'Updating...' : 'Creating...'
          ) : (
            isEdit ? 'Update Product' : 'Create Product'
          )}
        </button>
      </div>
    </form>
  );
};