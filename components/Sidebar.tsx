import React, { useState, useEffect } from 'react';
import { SearchIcon, GlobeIcon, DatabaseIcon, WrenchIcon, ExternalLinkIcon } from '../constants';

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
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


const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategory, setSelectedCategory, searchTerm, setSearchTerm }) => {
  const [shortcutHint, setShortcutHint] = useState('⌘K');
  const allNavItems = ['All', ...categories.filter(c => c !== 'All')];

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

  return (
    <aside className="w-64 bg-white p-4 border-r border-slate-200 flex flex-col">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-800">QA Control</h1>
      </div>
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder={`Search... (${shortcutHint})`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full bg-slate-100 text-slate-800 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
      
      <nav className="flex-1 overflow-y-auto -mx-2">
        <ul className="space-y-1">
          {allNavItems.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <li key={category}>
                <button
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-indigo-500 transition-transform duration-200 ${isSelected ? 'scale-y-100' : 'scale-y-0'}`}></div>
                  <span className={isSelected ? 'text-indigo-600' : 'text-slate-500'}>
                    {getCategoryIcon(category)}
                  </span>
                  <span>{category}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
        <p>All data is persisted in the backend.</p>
      </footer>
    </aside>
  );
};

export default Sidebar;
