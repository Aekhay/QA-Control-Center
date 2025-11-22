import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, GlobeIcon, DatabaseIcon, WrenchIcon, ExternalLinkIcon, DragHandleIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from '../constants';

interface CategoryActionMenuProps {
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
}

const CategoryActionMenu: React.FC<CategoryActionMenuProps> = ({ onRename, onDelete, onClose, menuRef }) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuRef, onClose]);

    return (
        <div ref={menuRef} className="absolute z-20 right-2 top-9 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1 text-sm animate-fade-in" style={{ animationDuration: '150ms' }}>
            <button onClick={onRename} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                <PencilIcon className="w-4 h-4" />
                <span>Rename</span>
            </button>
            <button onClick={onDelete} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors">
                <TrashIcon className="w-4 h-4" />
                <span>Delete</span>
            </button>
        </div>
    );
};

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onAddCategoryClick: () => void;
  onRenameCategoryClick: (category: string) => void;
  onDeleteCategoryClick: (category: string) => void;
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


const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategory, setSelectedCategory, searchTerm, setSearchTerm, onReorder, isCollapsed, toggleCollapse, onAddCategoryClick, onRenameCategoryClick, onDeleteCategoryClick }) => {
  const [shortcutHint, setShortcutHint] = useState('⌘K');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [actionMenu, setActionMenu] = useState<{ category: string } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  
  // Defines categories that cannot be renamed or deleted.
  const nonManageableCategories = ['All', 'Test Data', 'Quick Tools'];

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
    <aside className={`flex flex-col p-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <h1 className="text-2xl font-bold text-black dark:text-white">QA Control</h1>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
      </div>

      {!isCollapsed && (
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
      )}
      
      <nav className="flex-1 overflow-y-auto -mx-2">
        <ul className="space-y-1">
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category;
            const isBeingDragged = draggedIndex === index;
            const isDragTarget = dragOverIndex === index;
            const isManageable = !nonManageableCategories.includes(category);
            
            return (
              <li key={category}
                draggable={!isCollapsed}
                onDragStart={(e) => !isCollapsed && handleDragStart(e, index)}
                onDragOver={(e) => !isCollapsed && handleDragOver(e, index)}
                onDrop={(e) => !isCollapsed && handleDrop(e, index)}
                onDragEnd={() => !isCollapsed && handleDragEnd()}
                onDragLeave={() => !isCollapsed && handleDragLeave()}
                className={`relative transition-opacity ${isBeingDragged ? 'opacity-40' : 'opacity-100'}`}
                title={isCollapsed ? category : ''}
              >
                {isDragTarget && !isCollapsed && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-400 z-10" />
                )}

                <div className="flex items-center w-full relative group">
                  <button
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-all duration-150 relative ${
                      isSelected
                        ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    {!isCollapsed && <DragHandleIcon className="w-5 h-5 text-gray-400 cursor-grab group-hover:opacity-100 opacity-0 transition-opacity" />}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-sky-400 transition-transform duration-200 ${isSelected ? 'scale-y-100' : 'scale-y-0'}`}></div>
                    <span className={isSelected ? 'text-sky-500 dark:text-sky-400' : 'text-gray-400'}>
                      {getCategoryIcon(category)}
                    </span>
                    {!isCollapsed && <span className="flex-1 text-left">{category}</span>}
                  </button>

                  {isManageable && !isCollapsed && (
                      <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenu(actionMenu?.category === category ? null : { category })
                          }}
                          className="absolute right-2 p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Actions for ${category}`}
                      >
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </button>
                  )}
                </div>

                {actionMenu?.category === category && (
                    <CategoryActionMenu
                      menuRef={actionMenuRef}
                      onClose={() => setActionMenu(null)}
                      onRename={() => {
                        onRenameCategoryClick(category);
                        setActionMenu(null);
                      }}
                      onDelete={() => {
                        onDeleteCategoryClick(category);
                        setActionMenu(null);
                      }}
                    />
                )}

              </li>
            );
          })}
        </ul>
      </nav>

      {!isCollapsed && (
        <footer className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
           <button onClick={onAddCategoryClick} className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span>New Category</span>
          </button>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">Link data is persisted in the backend. Other data is saved locally.</p>
        </footer>
      )}
    </aside>
  );
};

export default Sidebar;