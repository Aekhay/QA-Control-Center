import React, { useEffect } from 'react';
import { LinkItem } from '../types';

interface ConfirmBulkDeleteModalProps {
  linksToDelete: LinkItem[];
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmBulkDeleteModal: React.FC<ConfirmBulkDeleteModalProps> = ({ linksToDelete, onClose, onConfirm }) => {
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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative border border-gray-700">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Confirm Deletion</h2>
        <p className="text-gray-400 mb-2">
            Are you sure you want to permanently delete the following <strong>{linksToDelete.length}</strong> item(s)?
        </p>
        <div className="my-4 max-h-48 overflow-y-auto bg-gray-900 p-3 rounded-md space-y-1 border border-gray-700">
            <ul className="list-disc list-inside text-sm text-gray-300">
                {linksToDelete.map(link => (
                    <li key={link.id} className="truncate">
                        {link.name}
                    </li>
                ))}
            </ul>
        </div>
         <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBulkDeleteModal;