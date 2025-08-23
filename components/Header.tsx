import React from 'react';
import { GridViewIcon, ListViewIcon, PlusIcon, TrashIcon } from '../constants';

interface HeaderProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  onAddClick: () => void;
  isDeleteModeActive: boolean;
  toggleDeleteMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ viewMode, setViewMode, onAddClick, isDeleteModeActive, toggleDeleteMode }) => {
  return (
    <header className="bg-white/70 backdrop-blur-lg sticky top-0 z-10 p-4 shadow-sm border-b border-slate-200">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">
          QA Control Center
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddClick}
            className="p-2 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
            aria-label="Add new link"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center bg-slate-200 p-1 rounded-full">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'grid' ? 'bg-white text-sky-500' : 'text-slate-500'
              }`}
              aria-label="Grid view"
            >
              <GridViewIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'list' ? 'bg-white text-sky-500' : 'text-slate-500'
              }`}
              aria-label="List view"
            >
              <ListViewIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={toggleDeleteMode}
            className={`p-2 rounded-full transition-colors ${
                isDeleteModeActive
                ? 'bg-red-100 text-red-500'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
            aria-label="Toggle delete mode"
            >
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;