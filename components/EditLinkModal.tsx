import React, { useState, useEffect } from 'react';
import { LinkItem } from '../types';
import { CloseIcon } from '../constants';
import Dropdown from './Dropdown';

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Link</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="link-name" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Name
            </label>
            <input
              type="text"
              id="link-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="link-url" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              URL
            </label>
            <input
              type="url"
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="link-category" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Category
            </label>
            <Dropdown
              options={categories}
              selectedOption={category}
              onSelectOption={setCategory}
              placeholder="Select or create a category"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
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