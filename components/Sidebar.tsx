import React, { useState, useEffect } from 'react';
import { SearchIcon, ChevronDownIcon } from '../constants';

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategory, setSelectedCategory, searchTerm, setSearchTerm }) => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [shortcutHint, setShortcutHint] = useState('⌘K');
  const allNavItems = ['All', ...categories];

  useEffect(() => {
    // Set hint based on OS
    if (typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') < 0) {
        setShortcutHint('Ctrl+K');
    }
  }, []);

  return (
    <aside className="w-64 bg-white p-4 border-r border-slate-200 flex flex-col h-screen">
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder={`Search... (${shortcutHint})`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full bg-slate-100 text-slate-800 rounded-full border border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
        />
      </div>

      <div
        className="flex justify-between items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer mb-2"
        onClick={() => setIsNavOpen(!isNavOpen)}
      >
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Menu</h2>
        <ChevronDownIcon
            className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${
              isNavOpen ? 'rotate-180' : ''
            }`}
          />
      </div>
      
      {isNavOpen && (
        <nav className="flex-1 overflow-y-auto">
          <ul>
            {allNavItems.map((category) => (
              <li key={category} className="mb-1">
                <button
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-sky-100 text-sky-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <footer className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
        <p>
            To restore default data, clear the application's local storage.
        </p>
      </footer>
    </aside>
  );
};

export default Sidebar;