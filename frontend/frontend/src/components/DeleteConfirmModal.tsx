import React from 'react';

interface DeleteConfirmModalProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  itemName,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="delete-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Confirmation</h3>
          <button
            className="close-button"
            onClick={onCancel}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="warning-icon">⚠️</div>
          <p>Are you sure you want to delete <strong>"{itemName}"</strong>?</p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>

        <div className="modal-actions">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="delete-button dangerous"
          >
            {isLoading ? (
              <>
                <span className="spinner small"></span>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};