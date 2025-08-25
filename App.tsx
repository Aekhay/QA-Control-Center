import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LinkItem, CategorizedLinks, TestDataSet, HealthStatus, ApiEnvironment } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EditLinkModal from './components/EditLinkModal';
import AddLinkModal from './components/AddLinkModal';
import ConfirmBulkDeleteModal from './components/ConfirmBulkDeleteModal';
import CommandPalette from './components/CommandPalette';
import TestDataView from './components/TestDataView';
import Toast from './components/Toast';
import QuickToolsView from './components/QuickToolsView';
import CategorySection from './components/CategorySection';

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
  
  // State for Health Checks
  const [healthStatuses, setHealthStatuses] = useState<Record<string, HealthStatus>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State for Test Data and Toasts
  const [testDataSets, setTestDataSets] = useState<TestDataSet[]>([]);
  const [activeDataSetId, setActiveDataSetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'found' | 'not_found' } | null>(null);

  // State for Quick Tools API Environments
  const [apiEnvironments, setApiEnvironments] = useState<ApiEnvironment[]>([]);

  const isLinksView = !['Test Data', 'Quick Tools'].includes(selectedCategory);

  // --- Health Checks ---
  const runHealthChecks = useCallback(async () => {
    setIsRefreshing(true);
    const siteLinks = allLinks.filter(link => link.category === 'Sites');
    
    // Set all to checking
    setHealthStatuses(prev => {
        const newState = {...prev};
        siteLinks.forEach(link => newState[link.id] = 'checking');
        return newState;
    });

    await Promise.all(siteLinks.map(async (link) => {
        try {
            // Using 'no-cors' to check for reachability without running into CORS issues.
            // This won't give a status code but tells us if the server responded.
            await fetch(link.url, { mode: 'no-cors', signal: AbortSignal.timeout(5000) });
            setHealthStatuses(prev => ({...prev, [link.id]: 'online'}));
        } catch (error) {
            setHealthStatuses(prev => ({...prev, [link.id]: 'offline'}));
        }
    }));
    setIsRefreshing(false);
  }, [allLinks]);


  // Global keydown listener for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (isLinksView) {
                setIsCommandPaletteOpen(true);
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLinksView]);


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

    const loadTestData = () => {
        try {
            const savedData = localStorage.getItem('skuTestDataSet');
            if (savedData) setTestDataSets(JSON.parse(savedData));

            const savedActiveId = localStorage.getItem('activeSkuDataSetId');
            if (savedActiveId) setActiveDataSetId(savedActiveId);

        } catch (error) {
            console.error("Failed to load test data from localStorage", error);
        }
    };
    
    const loadApiEnvironments = () => {
        try {
            const savedData = localStorage.getItem('apiEnvironments');
            if (savedData) setApiEnvironments(JSON.parse(savedData));
        } catch (error) {
            console.error("Failed to load API environments from localStorage", error);
        }
    };

    fetchLinks();
    loadTestData();
    loadApiEnvironments();
  }, []);
  
  // Initial Health Check
  useEffect(() => {
    if (allLinks.length > 0) {
        runHealthChecks();
    }
  }, [allLinks.length]); // Depends on the number of links to run once
  
  // SKU Search Effect
  useEffect(() => {
    const SKU_REGEX = /^\d{8,}$/; // Simple regex for SKU-like numbers (8+ digits)

    if (SKU_REGEX.test(searchTerm.trim()) && testDataSets.length > 0) {
        const activeDataSet = testDataSets.find(ds => ds.id === activeDataSetId);
        if (!activeDataSet) return;

        const query = searchTerm.trim();
        const found = activeDataSet.tableData.rows.some(row => row.some(cell => cell === query));

        setToast({
            message: found
                ? `SKU ${query} is in active dataset "${activeDataSet.name}".`
                : `SKU ${query} is available for Testing.`,
            type: found ? 'found' : 'not_found'
        });
    }
  }, [searchTerm, testDataSets, activeDataSetId]);

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
    
    setIsConfirmBulkDeleteOpen(false);
    setSelectedLinkIds([]);
    setIsDeleteModeActive(false);
  };
  
  const handleDataSetsChange = (dataSets: TestDataSet[]) => {
    setTestDataSets(dataSets);
    localStorage.setItem('skuTestDataSet', JSON.stringify(dataSets));
    if (dataSets.length === 0) {
        setActiveDataSetId(null);
        localStorage.removeItem('activeSkuDataSetId');
    }
  };
  
  const handleSetActiveDataSet = (id: string) => {
    setActiveDataSetId(id);
    localStorage.setItem('activeSkuDataSetId', id);
  };

  const handleApiEnvsChange = (envs: ApiEnvironment[]) => {
      setApiEnvironments(envs);
      localStorage.setItem('apiEnvironments', JSON.stringify(envs));
  }

  const toggleDeleteMode = () => {
    setIsDeleteModeActive(!isDeleteModeActive);
    setSelectedLinkIds([]); 
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
      const linkWithStatus = {
          ...link,
          healthStatus: link.category === 'Sites' ? healthStatuses[link.id] || 'idle' : undefined
      };
      acc[category].push(linkWithStatus);
      return acc;
    }, {} as CategorizedLinks);
  }, [allLinks, healthStatuses]);

  const sidebarCategories = useMemo(() => {
    return ['Sites', ...Object.keys(categorizedLinks).filter(c => c !== 'Sites'), 'Test Data', 'Quick Tools'];
  }, [categorizedLinks]);

  const filteredLinks = useMemo<CategorizedLinks>(() => {
    if (!isLinksView) return {};
    
    const lowercasedFilter = searchTerm.toLowerCase();
    
    // If the search term is an SKU, don't filter the links list
    const SKU_REGEX = /^\d{8,}$/;
    if (SKU_REGEX.test(searchTerm.trim())) {
        return categorizedLinks;
    }

    let linksToFilter = { ...categorizedLinks };

    if (selectedCategory !== 'All' && categorizedLinks[selectedCategory]) {
        linksToFilter = { [selectedCategory]: linksToFilter[selectedCategory] };
    } else if (selectedCategory !== 'All' ) {
        return {};
    }

    if (!searchTerm.trim()) {
      return linksToFilter;
    }
    
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
  }, [searchTerm, categorizedLinks, selectedCategory, isLinksView]);

  const hasResults = useMemo(() => Object.values(filteredLinks).some(links => links.length > 0), [filteredLinks]);
    
  const showDeleteBar = isDeleteModeActive && selectedLinkIds.length > 0;

  let animationCounter = 0;

  const renderMainContent = () => {
    if (isLinksView) {
      return loading ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-slate-600">Loading links...</h2>
        </div>
      ) : hasResults ? (
         Object.entries(filteredLinks).map(([category, links]) => {
            const section = (
              <CategorySection
                key={category}
                category={category}
                links={links}
                viewMode={viewMode}
                onEdit={setEditingLink}
                isDeleteModeActive={isDeleteModeActive}
                selectedLinkIds={selectedLinkIds}
                onSelect={handleSelectLink}
                showCategoryTitle={selectedCategory === 'All'}
                animationStartIndex={animationCounter}
              />
            );
            animationCounter += links.length;
            return section;
         })
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-slate-600">No results found</h2>
          <p className="mt-2 text-slate-500">Try adjusting your search or filter.</p>
        </div>
      );
    }
    
    if (selectedCategory === 'Test Data') {
      return (
        <TestDataView 
            dataSets={testDataSets}
            onDataSetsChange={handleDataSetsChange}
            activeDataSetId={activeDataSetId}
            onSetActive={handleSetActiveDataSet}
        />
      );
    }

    if (selectedCategory === 'Quick Tools') {
        return (
            <QuickToolsView 
                apiEnvironments={apiEnvironments}
                onApiEnvsChange={handleApiEnvsChange}
            />
        );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-screen-xl flex bg-white rounded-xl shadow-lg overflow-hidden">
        <Sidebar
          categories={sidebarCategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {isLinksView && (
              <Header
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  onAddClick={() => setIsAddModalOpen(true)}
                  isDeleteModeActive={isDeleteModeActive}
                  toggleDeleteMode={toggleDeleteMode}
                  onRefresh={runHealthChecks}
                  isRefreshing={isRefreshing}
              />
          )}
          <main key={selectedCategory} className={`flex-1 overflow-y-auto animate-fade-in px-4 sm:px-6 lg:px-8 py-8 ${showDeleteBar ? 'pb-24' : ''}`}>
              {renderMainContent()}
          </main>
          
          {isLinksView && showDeleteBar && (
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-20 border-t border-slate-200">
                <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
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
        </div>
      </div>
      
      {isLinksView && isAddModalOpen && (
        <AddLinkModal
            categories={Object.keys(categorizedLinks)}
            onClose={() => setIsAddModalOpen(false)}
            onSave={handleSaveNewLink}
        />
      )}
      {isLinksView && editingLink && (
        <EditLinkModal
            link={editingLink}
            onClose={() => setEditingLink(null)}
            onSave={handleUpdateLink}
        />
      )}
      {isLinksView && isConfirmBulkDeleteOpen && (
        <ConfirmBulkDeleteModal
            linksToDelete={allLinks.filter(link => selectedLinkIds.includes(link.id))}
            onClose={() => setIsConfirmBulkDeleteOpen(false)}
            onConfirm={handleConfirmBulkDelete}
        />
      )}
      {isLinksView && isCommandPaletteOpen && (
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
       {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;
