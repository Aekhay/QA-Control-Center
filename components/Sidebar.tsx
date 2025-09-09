import React, { useState, useEffect } from 'react';
import { SearchIcon, GlobeIcon, DatabaseIcon, WrenchIcon, ExternalLinkIcon, DragHandleIcon } from '../constants';

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

const getCategoryIcon = (category: string) => {
  if (category === 'All' || category === 'Sites') {
    return <GlobeIcon className="w-5 h-5" />;
  }
  if (category === 'Test Data') {
    return <DatabaseIcon className="w-5 h-5" />;
  }
  if (category === 'Quick Tools') {
    return <WrenchIcon className="w-5 h-5" />;
  }
  return <ExternalLinkIcon className="w-5 h-5" />;
};


const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategory, setSelectedCategory, searchTerm, setSearchTerm, onReorder }) => {
  const [shortcutHint, setShortcutHint] = useState('⌘K');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    // Set hint based on OS
    if (typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') < 0) {
        setShortcutHint('Ctrl+K');
    }
  }, []);
  
  const handleCategorySelect = (category: string) => {
    if (['Test Data', 'Quick Tools'].includes(category)) {
      setSearchTerm('');
    }
    setSelectedCategory(category);
  }

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    if (index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
    e.preventDefault();
    const startIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (startIndex !== dropIndex) {
      onReorder(startIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };


  return (
    <aside className="w-64 bg-white dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">QA Control</h1>
      </div>
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search... (${shortcutHint})`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
        />
      </div>
      
      <nav className="flex-1 overflow-y-auto -mx-2">
        <ul className="space-y-1">
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category;
            const isBeingDragged = draggedIndex === index;
            const isDragTarget = dragOverIndex === index;
            
            return (
              <li key={category}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                className={`relative group transition-opacity ${isBeingDragged ? 'opacity-40' : 'opacity-100'}`}
              >
                {isDragTarget && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-400 z-10" />
                )}
                <button
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <DragHandleIcon className="w-5 h-5 text-gray-400 cursor-grab group-hover:opacity-100 opacity-0 transition-opacity" />
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-sky-400 transition-transform duration-200 ${isSelected ? 'scale-y-100' : 'scale-y-0'}`}></div>
                  <span className={isSelected ? 'text-sky-500 dark:text-sky-400' : 'text-gray-400'}>
                    {getCategoryIcon(category)}
                  </span>
                  <span className="flex-1 text-left">{category}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
        <p>Link data is persisted in the backend. Other data is saved locally.</p>
      </footer>
    </aside>
  );
};

export default Sidebar;