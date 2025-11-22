import React, { useState, useEffect } from 'react';
import { GridViewIcon, ListViewIcon, PlusIcon, TrashIcon, RefreshIcon, SearchIcon } from '../constants';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  onAddClick: () => void;
  isDeleteModeActive: boolean;
  toggleDeleteMode: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  viewMode, setViewMode, onAddClick, isDeleteModeActive, toggleDeleteMode, 
  onRefresh, isRefreshing, theme, toggleTheme, isSidebarCollapsed, searchTerm, setSearchTerm 
}) => {
  const [shortcutHint, setShortcutHint] = useState('⌘K');

  useEffect(() => {
      if (typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') < 0) {
          setShortcutHint('Ctrl+K');
      }
  }, []);

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg sticky top-0 z-10 py-4 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center w-full gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Links
        </h1>
        
        <div className="flex-1 flex justify-center">
            {isSidebarCollapsed && (
                <div className="relative w-full max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder={`Search... (${shortcutHint})`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    />
                </div>
            )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-200 dark:bg-gray-700 p-1 rounded-full">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'grid' ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              aria-label="Grid view"
            >
              <GridViewIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'list' ? 'bg-sky-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              aria-label="List view"
            >
              <ListViewIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>
          <div className="flex items-center gap-1">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-sky-400"
              aria-label="Refresh environment statuses"
            >
              <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onAddClick}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-sky-500 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-sky-400"
              aria-label="Add new link"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
            <button
              onClick={toggleDeleteMode}
              className={`p-2 rounded-full transition-colors ${
                  isDeleteModeActive
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-gray-500 hover:bg-gray-200 hover:text-red-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-500'
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