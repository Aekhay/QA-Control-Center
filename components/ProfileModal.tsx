import React, { useState, useEffect } from 'react';
import { ChromeProfile } from '../types';
import { CloseIcon } from '../constants';

interface ProfileModalProps {
  onClose: () => void;
  onSave: (profile: Omit<ChromeProfile, 'id'>) => void;
  profileToEdit: ChromeProfile | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onSave, profileToEdit }) => {
  const [name, setName] = useState(profileToEdit?.name || '');
  const [directoryName, setDirectoryName] = useState(profileToEdit?.directoryName || '');

  const isEditing = !!profileToEdit;

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !directoryName.trim()) return;
    onSave({ name, directoryName });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-100">
            {isEditing ? 'Edit Chrome Profile' : 'Add New Profile'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-700"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-400 mb-1">
              Profile Name
            </label>
            <input
              type="text"
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Work Account"
              className="w-full px-3 py-2 bg-gray-900 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label htmlFor="profile-dir" className="block text-sm font-medium text-gray-400 mb-1">
              Profile Directory Name
            </label>
            <input
              type="text"
              id="profile-dir"
              value={directoryName}
              onChange={(e) => setDirectoryName(e.target.value)}
              placeholder="e.g., Profile 1"
              className="w-full px-3 py-2 bg-gray-900 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
             <p className="mt-2 text-xs text-gray-500">
                Find this in Chrome by navigating to <code>chrome://version</code> and looking at the "Profile Path".
                <br/>
                Example: <code>.../User Data/<strong>Profile 1</strong></code>
            </p>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium bg-sky-600 text-white hover:bg-sky-700 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Add Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
