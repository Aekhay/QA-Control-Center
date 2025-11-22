import React, { useEffect } from 'react';
import { CloseIcon } from '../constants';

interface ConfirmDeleteCategoryModalProps {
  categoryName: string;
  linkCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteCategoryModal: React.FC<ConfirmDeleteCategoryModalProps> = ({ categoryName, linkCount, onClose, onConfirm }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Confirm Category Deletion</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Are you sure you want to permanently delete the category <strong className="font-bold text-red-500">"{categoryName}"</strong>?
        </p>
        {linkCount > 0 && (
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            This will also delete the <strong>{linkCount}</strong> link(s) within this category.
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteCategoryModal;
