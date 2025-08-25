import React, { useState, useEffect } from 'react';
import { ApiEnvironment } from '../types';
import { CloseIcon } from '../constants';

interface ApiEnvModalProps {
  onClose: () => void;
  onSave: (env: Omit<ApiEnvironment, 'id'>) => void;
  environmentToEdit: ApiEnvironment | null;
}

const ApiEnvModal: React.FC<ApiEnvModalProps> = ({ onClose, onSave, environmentToEdit }) => {
  const [name, setName] = useState(environmentToEdit?.name || '');
  const [url, setUrl] = useState(environmentToEdit?.url || '');

  const isEditing = !!environmentToEdit;

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onSave({ name, url });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800">
            {isEditing ? 'Edit Environment' : 'Add New Environment'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="env-name" className="block text-sm font-medium text-slate-700 mb-1">
              Environment Name
            </label>
            <input
              type="text"
              id="env-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pre-Production"
              className="w-full px-3 py-2 bg-slate-100 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="env-url" className="block text-sm font-medium text-slate-700 mb-1">
              URL
            </label>
            <input
              type="text"
              id="env-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://.../findbysku?sku={{sku}}&_fields=siblings"
              className="w-full px-3 py-2 bg-slate-100 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
             <p className="mt-2 text-xs text-slate-500">
              For the Sibling Checker tool, use <code>{'{{sku}}'}</code> as a placeholder for the SKU.
              <br />
              Example: <code>https://preprod.ounass.ae/product/findbysku?sku={'{{sku}}'}&_fields=siblings</code>
            </p>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Add Environment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiEnvModal;