import React, { useState, useEffect, useMemo } from 'react';
import { LinkItem, CategorizedLinks } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LinkCard from './components/LinkCard';
import EditLinkModal from './components/EditLinkModal';
import AddLinkModal from './components/AddLinkModal';
import ConfirmBulkDeleteModal from './components/ConfirmBulkDeleteModal';
import CommandPalette from './components/CommandPalette';

const App: React.FC = () => {
  type ViewMode = 'grid' | 'list';

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [allLinks, setAllLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // State for bulk delete
  const [isDeleteModeActive, setIsDeleteModeActive] = useState(false);
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [isConfirmBulkDeleteOpen, setIsConfirmBulkDeleteOpen] = useState(false);

  // State for command palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global keydown listener for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsCommandPaletteOpen(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  // Data loading and persistence
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        let linksData: LinkItem[];
        const savedLinks = localStorage.getItem('qaCenterLinks');

        if (savedLinks) {
          linksData = JSON.parse(savedLinks);
        } else {
          const response = await fetch('./links.json');
          if (!response.ok) throw new Error('Failed to load default links data');
          const defaultLinks: Omit<LinkItem, 'id'>[] = await response.json();
          linksData = defaultLinks.map(link => ({...link, id: crypto.randomUUID() }));
          localStorage.setItem('qaCenterLinks', JSON.stringify(linksData));
        }
        setAllLinks(linksData);
      } catch (error) {
        console.error("Error loading links:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  const handleUpdateLink = (updatedLink: LinkItem) => {
    const updatedLinks = allLinks.map(link => link.id === updatedLink.id ? updatedLink : link);
    setAllLinks(updatedLinks);
    localStorage.setItem('qaCenterLinks', JSON.stringify(updatedLinks));
    setEditingLink(null);
  };
  
  const handleSaveNewLink = (newLinkData: Omit<LinkItem, 'id'>) => {
    const newLink = { ...newLinkData, id: crypto.randomUUID() };
    const updatedLinks = [...allLinks, newLink];
    setAllLinks(updatedLinks);
    localStorage.setItem('qaCenterLinks', JSON.stringify(updatedLinks));
    setIsAddModalOpen(false);
  };
  
  const handleConfirmBulkDelete = () => {
    const updatedLinks = allLinks.filter(link => !selectedLinkIds.includes(link.id));
    setAllLinks(updatedLinks);
    localStorage.setItem('qaCenterLinks', JSON.stringify(updatedLinks));
    
    // Reset and exit delete mode
    setIsConfirmBulkDeleteOpen(false);
    setSelectedLinkIds([]);
    setIsDeleteModeActive(false);
  };

  const toggleDeleteMode = () => {
    setIsDeleteModeActive(!isDeleteModeActive);
    setSelectedLinkIds([]); // Clear selections when toggling mode
  };
  
  const handleSelectLink = (linkId: string) => {
    setSelectedLinkIds(prev =>
      prev.includes(linkId)
        ? prev.filter(id => id !== linkId)
        : [...prev, linkId]
    );
  };
  
  const handleCancelSelection = () => {
    setSelectedLinkIds([]);
  };


  const categorizedLinks = useMemo(() => {
    return allLinks.reduce((acc: CategorizedLinks, link) => {
      const category = link.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(link);
      return acc;
    }, {});
  }, [allLinks]);

  const filteredLinks = useMemo(() => {
    let linksToFilter = { ...categorizedLinks };

    if (selectedCategory !== 'All') {
        linksToFilter = { [selectedCategory]: linksToFilter[selectedCategory] || [] };
    }

    if (!searchTerm.trim()) {
      return linksToFilter;
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered: CategorizedLinks = {};

    for (const category in linksToFilter) {
      const matchingLinks = linksToFilter[category].filter(link =>
        link.name.toLowerCase().includes(lowercasedFilter) ||
        link.url.toLowerCase().includes(lowercasedFilter) ||
        link.category.toLowerCase().includes(lowercasedFilter)
      );
      if (matchingLinks.length > 0) {
        filtered[category] = matchingLinks;
      }
    }
    return filtered;
  }, [searchTerm, categorizedLinks, selectedCategory]);

  const hasResults = Object.values(filteredLinks).some(links => links.length > 0);

  const viewWrapperClasses = viewMode === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    : 'flex flex-col gap-2';
    
  const showDeleteBar = isDeleteModeActive && selectedLinkIds.length > 0;

  return (
    <div className="flex min-h-screen text-slate-800 bg-slate-100">
      <Sidebar
        categories={Object.keys(categorizedLinks)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <div className="flex-1 flex flex-col h-screen">
        <Header
            viewMode={viewMode}
            setViewMode={setViewMode}
            onAddClick={() => setIsAddModalOpen(true)}
            isDeleteModeActive={isDeleteModeActive}
            toggleDeleteMode={toggleDeleteMode}
        />
        <main className={`flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto ${showDeleteBar ? 'pb-24' : ''}`}>
          {loading ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-slate-600">Loading links...</h2>
            </div>
          ) : hasResults ? (
             Object.entries(filteredLinks).map(([category, links]) => (
                <section key={category} className="mb-8">
                    {selectedCategory === 'All' && (
                         <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b-2 border-sky-500/30">
                            {category}
                         </h2>
                    )}
                    <div className={viewWrapperClasses}>
                        {links.map((link) => (
                           <LinkCard 
                            key={link.id} 
                            link={link} 
                            viewMode={viewMode} 
                            onEdit={() => setEditingLink(link)}
                            isDeleteModeActive={isDeleteModeActive}
                            isSelected={selectedLinkIds.includes(link.id)}
                            onSelect={handleSelectLink}
                          />
                        ))}
                    </div>
                </section>
             ))
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-slate-600">No results found</h2>
              <p className="mt-2 text-slate-500">Try adjusting your search or filter.</p>
            </div>
          )}
        </main>
      </div>
      
      {showDeleteBar && (
        <div className="fixed bottom-0 left-64 right-0 bg-white/80 backdrop-blur-sm z-20 border-t border-slate-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                <span className="font-medium text-slate-700">
                    {selectedLinkIds.length} item(s) selected
                </span>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCancelSelection}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => setIsConfirmBulkDeleteOpen(true)}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                        Delete Selected
                    </button>
                </div>
            </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddLinkModal
            categories={Object.keys(categorizedLinks)}
            onClose={() => setIsAddModalOpen(false)}
            onSave={handleSaveNewLink}
        />
      )}
      {editingLink && (
        <EditLinkModal
            link={editingLink}
            onClose={() => setEditingLink(null)}
            onSave={handleUpdateLink}
        />
      )}
      {isConfirmBulkDeleteOpen && (
        <ConfirmBulkDeleteModal
            linksToDelete={allLinks.filter(link => selectedLinkIds.includes(link.id))}
            onClose={() => setIsConfirmBulkDeleteOpen(false)}
            onConfirm={handleConfirmBulkDelete}
        />
      )}
      {isCommandPaletteOpen && (
        <CommandPalette 
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            links={allLinks}
            onAddLink={() => {
                setIsCommandPaletteOpen(false);
                setIsAddModalOpen(true);
            }}
            onToggleDeleteMode={() => {
                setIsCommandPaletteOpen(false);
                toggleDeleteMode();
            }}
            onSetViewMode={(mode) => {
                setIsCommandPaletteOpen(false);
                setViewMode(mode);
            }}
        />
      )}
    </div>
  );
};

export default App;