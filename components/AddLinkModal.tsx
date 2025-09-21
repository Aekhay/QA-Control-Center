import React, { useState, useEffect } from 'react';
import { LinkItem } from '../types';
import { CloseIcon } from '../constants';
import Dropdown from './Dropdown';

interface AddLinkModalProps {
  categories: string[];
  onClose: () => void;
  onSave: (link: Omit<LinkItem, 'id'>) => void;
}

const ContentTypeToggle: React.FC<{ type: 'url' | 'text', setType: (type: 'url' | 'text') => void }> = ({ type, setType }) => {
    const baseClasses = "px-4 py-1.5 text-sm font-medium transition-colors rounded-md flex-1";
    const activeClasses = "bg-sky-600 text-white shadow-sm";
    const inactiveClasses = "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";
  
    return (
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
        <button type="button" onClick={() => setType('url')} className={`${baseClasses} ${type === 'url' ? activeClasses : inactiveClasses}`}>URL</button>
        <button type="button" onClick={() => setType('text')} className={`${baseClasses} ${type === 'text' ? activeClasses : inactiveClasses}`}>Text</button>
      </div>
    );
};

const AddLinkModal: React.FC<AddLinkModalProps> = ({ categories, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'url' | 'text'>('url');
  const [error, setError] = useState('');

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
    setError('');
    if (!name.trim() || !content.trim() || !category.trim()) return;

    if (type === 'url') {
      try {
        new URL(content);
      } catch (_) {
        setError('Please enter a valid URL, including https://');
        return;
      }
    }

    onSave({ name, content, category, type });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Link</h2>
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
            <label htmlFor="add-link-name" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Name
            </label>
            <input
              type="text"
              id="add-link-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="add-link-content" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Content
            </label>
            <div className="flex items-center gap-2 mb-2">
                <ContentTypeToggle type={type} setType={setType} />
            </div>
            <input
              type={type === 'url' ? 'url' : 'text'}
              id="add-link-content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setError('');
              }}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
              Add Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLinkModal;