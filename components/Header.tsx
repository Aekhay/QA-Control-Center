import React from 'react';
import { GridViewIcon, ListViewIcon, PlusIcon, TrashIcon, RefreshIcon } from '../constants';

interface HeaderProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  onAddClick: () => void;
  isDeleteModeActive: boolean;
  toggleDeleteMode: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const Header: React.FC<HeaderProps> = ({ viewMode, setViewMode, onAddClick, isDeleteModeActive, toggleDeleteMode, onRefresh, isRefreshing }) => {
  return (
    <header className="bg-gray-800/80 backdrop-blur-lg sticky top-0 z-10 py-4 border-b border-gray-700 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-100 tracking-tight">
          Links
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-900 p-1 rounded-full">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'grid' ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Grid view"
            >
              <GridViewIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'list' ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
              aria-label="List view"
            >
              <ListViewIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="w-px h-6 bg-gray-700 mx-2"></div>
          <div className="flex items-center gap-1">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-[#A4CAFE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh environment statuses"
            >
              <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onAddClick}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-[#31C48D] transition-colors"
              aria-label="Add new link"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
            <button
              onClick={toggleDeleteMode}
              className={`p-2 rounded-full transition-colors ${
                  isDeleteModeActive
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-[#E02424]'
              }`}
              aria-label="Toggle delete mode"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;