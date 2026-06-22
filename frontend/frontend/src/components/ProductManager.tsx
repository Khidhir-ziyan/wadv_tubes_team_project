import React, { useState } from 'react';
import type { Product } from '../types/api';
import { useProductService } from '../hooks/useProductService';
import { useDeleteWithFeedback } from '../hooks/useDeleteWithFeedback';
import { useNotification } from '../hooks/useNotification';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { NotificationContainer } from './NotificationContainer';

type View = 'list' | 'create' | 'edit';

export const ProductManager: React.FC = () => {
  const {
    products,
    productsLoading,
    productsError,
    refetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteLoading
  } = useProductService();

  const { deleteState, initiateDelete, confirmDelete, cancelDelete } = useDeleteWithFeedback();
  const { notifications, showNotification, removeNotification } = useNotification();

  const [view, setView] = useState<View>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateSuccess = async () => {
    setView('list');
    showNotification('success', 'Product created successfully!');
    refetchProducts();
  };

  const handleUpdateSuccess = async () => {
    setView('list');
    setEditingProduct(null);
    showNotification('success', 'Product updated successfully!');
    refetchProducts();
  };

  const handleDeleteInitiate = (product: Product) => {
    initiateDelete(product.id, product.name);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState.itemToDelete) return;

    try {
      await deleteProduct(deleteState.itemToDelete.id);
      confirmDelete();
      showNotification('success', 'Product deleted successfully!');
      refetchProducts();
    } catch (error) {
      showNotification('error', 'Failed to delete product. Please try again.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setView('edit');
  };

  const filteredProducts = (products || []).filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="product-manager">
      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Header */}
      <header className="manager-header">
        <h1>Product Management System</h1>

        {view === 'list' && (
          <div className="header-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search products by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <button
              className="create-button primary"
              onClick={() => setView('create')}
            >
              ➕ Create New Product
            </button>
          </div>
        )}

        {(view === 'create' || view === 'edit') && (
          <div className="header-controls">
            <button
              className="back-button"
              onClick={() => {
                setView('list');
                setEditingProduct(null);
              }}
            >
              ← Back to List
            </button>
          </div>
        )}
      </header>

      {/* Main content area */}
      <main className="manager-content">
        {view === 'list' && (
          <ProductList
            products={filteredProducts}
            loading={productsLoading}
            error={productsError}
            onEdit={handleEdit}
            onDelete={handleDeleteInitiate}
            onRefresh={refetchProducts}
          />
        )}

        {view === 'create' && (
          <div className="form-container">
            <ProductForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setView('list')}
            />
          </div>
        )}

        {view === 'edit' && editingProduct && (
          <div className="form-container">
            <ProductForm
              product={editingProduct}
              onSuccess={handleUpdateSuccess}
              onCancel={() => {
                setView('list');
                setEditingProduct(null);
              }}
            />
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deleteState.showConfirmation && deleteState.itemToDelete && (
        <DeleteConfirmModal
          itemName={deleteState.itemToDelete.name}
          onConfirm={handleDeleteConfirm}
          onCancel={cancelDelete}
          isLoading={deleteLoading}
        />
      )}

      {/* Global loading overlay for list operations */}
      {productsLoading && view === 'list' && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner large"></div>
            <p>Loading products...</p>
          </div>
        </div>
      )}
    </div>
  );
};