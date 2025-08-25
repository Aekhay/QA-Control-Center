import React, { useState, useEffect } from 'react';
import { LinkItem } from '../types';
import { CloseIcon } from '../constants';

interface EditLinkModalProps {
  link: LinkItem;
  onClose: () => void;
  onSave: (link: LinkItem) => void;
  categories: string[];
}

const EditLinkModal: React.FC<EditLinkModalProps> = ({ link, onClose, onSave, categories }) => {
  const [name, setName] = useState(link.name);
  const [url, setUrl] = useState(link.url);
  const [category, setCategory] = useState(link.category);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...link, name, url, category });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Edit Link</h2>
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
            <label htmlFor="link-name" className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="link-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="link-url" className="block text-sm font-medium text-slate-700 mb-1">
              URL
            </label>
            <input
              type="url"
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="link-category" className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <input
              type="text"
              id="link-category"
              list="category-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <datalist id="category-list">
              {categories.map(cat => <option key={cat} value={cat} />)}
            </datalist>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLinkModal;