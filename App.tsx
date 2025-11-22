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
import AddCategoryModal from './components/AddCategoryModal';
import RenameCategoryModal from './components/RenameCategoryModal';
import ConfirmDeleteCategoryModal from './components/ConfirmDeleteCategoryModal';
import * as api from './api';
import { DEFAULT_API_ENVIRONMENTS } from './environments';

const App: React.FC = () => {
  type ViewMode = 'grid' | 'list';
  type Theme = 'light' | 'dark';

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
  const [toast, setToast] = useState<{ message: string; type: 'found' | 'not_found' | 'warning' | 'success' } | null>(null);

  // API environments are now read from a static file
  const [apiEnvironments] = useState<ApiEnvironment[]>(DEFAULT_API_ENVIRONMENTS);

  // State for Sidebar category re-ordering
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  // State for Sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  // State for Category Management Modals
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [categoryToRename, setCategoryToRename] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (userPrefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const isLinksView = !['Test Data', 'Quick Tools'].includes(selectedCategory);

  // --- Data Fetching ---
  const fetchLinks = useCallback(async () => {
    try {
      const linksData = await api.getLinks();
      setAllLinks(linksData);
    } catch (error) {
      console.error("Error loading links:", error);
      setToast({ message: "Failed to load links from the backend.", type: 'warning' });
    }
  }, []);


  // --- Health Checks ---
  const runHealthChecks = useCallback(async () => {
    setIsRefreshing(true);
    const siteLinks = allLinks.filter(link => link.category === 'Sites');
    
    setHealthStatuses(prev => {
        const newState = {...prev};
        siteLinks.forEach(link => newState[link.id] = 'checking');
        return newState;
    });

    await Promise.all(siteLinks.map(async (link) => {
        try {
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
            if (isLinksView) setIsCommandPaletteOpen(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLinksView]);


  // Data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchLinks();

      // Load test data from localStorage
      const storedTestData = localStorage.getItem('testDataSets');
      const testData = storedTestData ? JSON.parse(storedTestData) : [];
      setTestDataSets(testData);
      if (testData.length > 0) {
        setActiveDataSetId(testData[0].id);
      }
      
      // Load category order from localStorage
      const storedCategoryOrder = localStorage.getItem('categoryOrder');
      if (storedCategoryOrder) {
        setCategoryOrder(JSON.parse(storedCategoryOrder));
      }

      setLoading(false);
    };

    loadInitialData();
  }, [fetchLinks]);
  
  // Persist category order to localStorage
  useEffect(() => {
    if (categoryOrder.length > 0) {
      localStorage.setItem('categoryOrder', JSON.stringify(categoryOrder));
    }
  }, [categoryOrder]);
  
  // Initial Health Check
  useEffect(() => {
    if (allLinks.length > 0) {
        runHealthChecks();
    }
  }, [allLinks.length, runHealthChecks]); 
  
  // SKU Search Effect
  useEffect(() => {
    const SKU_REGEX = /^\d{8,}$/; 

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

  const handleCopyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setToast({ message, type: 'success' });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        setToast({ message: "Failed to copy text.", type: 'warning' });
    });
  };

  const handleUpdateLink = async (updatedLinkData: LinkItem) => {
    try {
      await api.updateLink(updatedLinkData);
      setToast({ message: "Link updated successfully.", type: 'success' });
      await fetchLinks(); // Refetch to get updated data
    } catch (error) {
      console.error("Error updating link:", error);
      setToast({ message: "Failed to update link.", type: 'warning' });
    } finally {
      setEditingLink(null);
    }
  };
  
  const handleSaveNewLink = async (newLinkData: Omit<LinkItem, 'id'>) => {
    try {
      await api.addLink(newLinkData);
      setIsAddModalOpen(false);
      setToast({ message: "Link added successfully.", type: 'success' });
      await fetchLinks(); // Refetch to get the new link with its real ID
    } catch (error) {
      console.error("Error adding new link:", error);
      setToast({ message: "Failed to save the new link.", type: 'warning' });
    }
  };
  
  const handleConfirmBulkDelete = async () => {
    try {
        await api.deleteLinks(selectedLinkIds);
        setToast({ message: `${selectedLinkIds.length} link(s) deleted.`, type: 'success' });
        await fetchLinks(); // Refetch to get the updated list
    } catch (error) {
        console.error("Error deleting links:", error);
        setToast({ message: "Failed to delete links.", type: 'warning' });
    } finally {
        setIsConfirmBulkDeleteOpen(false);
        setSelectedLinkIds([]);
        setIsDeleteModeActive(false);
    }
  };

  // --- Category Management Handlers ---
  const handleAddCategory = (newCategoryName: string) => {
    const trimmedName = newCategoryName.trim();
    if (sidebarCategories.map(c => c.toLowerCase()).includes(trimmedName.toLowerCase())) {
        setToast({ message: `Category "${trimmedName}" already exists.`, type: 'warning' });
        return;
    }
    setCategoryOrder(prev => [...prev, trimmedName]);
    setToast({ message: `Category "${trimmedName}" added. Add a link to make it permanent.`, type: 'success' });
  };

  const handleRenameCategory = async (oldName: string, newName: string) => {
    setCategoryToRename(null);
    if (oldName === newName) return;
    if (sidebarCategories.map(c => c.toLowerCase()).includes(newName.toLowerCase())) {
        setToast({ message: `Category "${newName}" already exists.`, type: 'warning' });
        return;
    }

    const linksToUpdate = allLinks.filter(link => link.category === oldName);
    if (linksToUpdate.length === 0) { // Renaming an empty category
        setCategoryOrder(prev => prev.map(c => c === oldName ? newName : c));
        setToast({ message: 'Category renamed.', type: 'success' });
        return;
    }

    setToast({ message: `Renaming category... This may take a moment.`, type: 'success' });
    try {
        await Promise.all(
            linksToUpdate.map(link => api.updateLink({ ...link, category: newName }))
        );
        setToast({ message: 'Category renamed successfully.', type: 'success' });
        await fetchLinks();
        if (selectedCategory === oldName) setSelectedCategory(newName);
    } catch (error) {
        console.error("Error renaming category:", error);
        setToast({ message: 'Failed to rename category.', type: 'warning' });
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    const idsToDelete = allLinks.filter(link => link.category === categoryToDelete).map(l => l.id);
    
    setCategoryToDelete(null); // Close modal immediately

    if (idsToDelete.length === 0) { // Deleting an empty category from order
        setCategoryOrder(prev => prev.filter(c => c !== categoryToDelete));
        if (selectedCategory === categoryToDelete) setSelectedCategory('All');
        setToast({ message: `Category "${categoryToDelete}" deleted.`, type: 'success' });
        return;
    }

    try {
        await api.deleteLinks(idsToDelete);
        setToast({ message: `Category "${categoryToDelete}" and its ${idsToDelete.length} link(s) deleted.`, type: 'success' });
        if (selectedCategory === categoryToDelete) setSelectedCategory('All');
        await fetchLinks();
    } catch (error) {
        console.error("Error deleting category:", error);
        setToast({ message: "Failed to delete category.", type: 'warning' });
    }
  };
  
  // Test Data Handlers (localStorage)
  const handleAddTestDataSet = (newDataSet: Omit<TestDataSet, 'id'>) => {
    const dataSetWithId = { ...newDataSet, id: Date.now().toString() };
    const updatedDataSets = [...testDataSets, dataSetWithId];
    setTestDataSets(updatedDataSets);
    localStorage.setItem('testDataSets', JSON.stringify(updatedDataSets));
    if (testDataSets.length === 0) setActiveDataSetId(dataSetWithId.id);
    setToast({ message: "Test data set uploaded.", type: 'success' });
  };

  const handleDeleteTestDataSet = (id: string) => {
    const updatedDataSets = testDataSets.filter(ds => ds.id !== id);
    setTestDataSets(updatedDataSets);
    localStorage.setItem('testDataSets', JSON.stringify(updatedDataSets));
    if (activeDataSetId === id) {
        setActiveDataSetId(updatedDataSets.length > 0 ? updatedDataSets[0].id : null);
    }
    setToast({ message: "Test data set deleted.", type: 'success' });
  };

  // Reorder handler
  const handleReorderCategories = (startIndex: number, endIndex: number) => {
    const result = Array.from(sidebarCategories); // Use the currently displayed list
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setCategoryOrder(result);
  };

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

  const categorizedLinks = useMemo(() => {
    return allLinks.reduce((acc: CategorizedLinks, link) => {
      // If a link has no category or an empty category, skip it.
      if (!link.category || link.category.trim() === '') {
        return acc;
      }
      const category = link.category;
      if (!acc[category]) acc[category] = [];
      
      const linkWithStatus = {
          ...link,
          healthStatus: link.category === 'Sites' ? healthStatuses[link.id] || 'idle' : undefined
      };
      acc[category].push(linkWithStatus);
      return acc;
    }, {} as CategorizedLinks);
  }, [allLinks, healthStatuses]);

  const sidebarCategories = useMemo(() => {
    const dynamicCategories = Object.keys(categorizedLinks);
    const allCurrentCats = [...new Set(['All', ...dynamicCategories, ...categoryOrder.filter(c => !dynamicCategories.includes(c)), 'Test Data', 'Quick Tools'])];
  
    // If no custom order is set, use a default sort
    if (categoryOrder.length === 0) {
      return allCurrentCats.sort((a, b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        return a.localeCompare(b);
      });
    }
  
    // Sort based on categoryOrder. Items not in categoryOrder go to the end.
    const sorted = [...allCurrentCats].sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
  
      if (indexA === -1 && indexB === -1) return a.localeCompare(b); // both new, sort alphabetically
      if (indexA === -1) return 1; // a is new, push to end
      if (indexB === -1) return -1; // b is new, push to end
      return indexA - indexB; // both are in the order array
    });
  
    // Sync the order state with any new categories that have appeared
    if (JSON.stringify(sorted) !== JSON.stringify(categoryOrder)) {
        // Sync only if there's a meaningful change
        const currentDynamicCats = new Set(Object.keys(categorizedLinks));
        const newOrder = sorted.filter(cat => 
            cat === 'All' || cat === 'Test Data' || cat === 'Quick Tools' || 
            currentDynamicCats.has(cat) || categoryOrder.includes(cat)
        );
        if(JSON.stringify(newOrder) !== JSON.stringify(categoryOrder)) {
           setCategoryOrder(newOrder);
        }
    }
  
    return sorted;
  }, [categorizedLinks, categoryOrder]);

  const filteredLinks = useMemo<CategorizedLinks>(() => {
    if (!isLinksView) return {};
    
    const lowercasedFilter = searchTerm.toLowerCase();
    
    const SKU_REGEX = /^\d{8,}$/;
    if (SKU_REGEX.test(searchTerm.trim())) return categorizedLinks;

    let linksToFilter = { ...categorizedLinks };

    if (selectedCategory !== 'All' && categorizedLinks[selectedCategory]) {
        linksToFilter = { [selectedCategory]: linksToFilter[selectedCategory] };
    } else if (selectedCategory !== 'All' ) {
        return {};
    }

    if (!searchTerm.trim()) return linksToFilter;
    
    const filtered: CategorizedLinks = {};

    for (const category in linksToFilter) {
      const matchingLinks = linksToFilter[category].filter(link =>
        link.name.toLowerCase().includes(lowercasedFilter) ||
        link.url.toLowerCase().includes(lowercasedFilter) ||
        link.category.toLowerCase().includes(lowercasedFilter)
      );
      if (matchingLinks.length > 0) filtered[category] = matchingLinks;
    }
    return filtered;
  }, [searchTerm, categorizedLinks, selectedCategory, isLinksView]);

  const hasResults = useMemo(() => Object.values(filteredLinks).some(links => links.length > 0), [filteredLinks]);
  const showDeleteBar = isDeleteModeActive && selectedLinkIds.length > 0;
  let animationCounter = 0;

  const renderMainContent = () => {
    if (isLinksView) {
      return loading ? (
        <div className="text-center py-16"><h2 className="text-2xl font-semibold text-gray-500 dark:text-gray-400">Loading links...</h2></div>
      ) : hasResults ? (
         Object.entries(filteredLinks).map(([category, links]) => {
            const section = (
              <CategorySection
                key={category} category={category} links={links} viewMode={viewMode}
                onEdit={setEditingLink} isDeleteModeActive={isDeleteModeActive}
                selectedLinkIds={selectedLinkIds} onSelect={handleSelectLink}
                showCategoryTitle={selectedCategory === 'All'}
                animationStartIndex={animationCounter}
                onCopyToClipboard={handleCopyToClipboard}
              />
            );
            animationCounter += links.length;
            return section;
         })
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-500 dark:text-gray-400">No results found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-500">Try adjusting your search or filter.</p>
        </div>
      );
    }
    
    if (selectedCategory === 'Test Data') {
      return (
        <TestDataView 
            dataSets={testDataSets}
            onAdd={handleAddTestDataSet}
            onDelete={handleDeleteTestDataSet}
            activeDataSetId={activeDataSetId}
            onSetActive={setActiveDataSetId}
        />
      );
    }

    if (selectedCategory === 'Quick Tools') {
        return (
            <QuickToolsView 
                apiEnvironments={apiEnvironments}
            />
        );
    }
    
    return null;
  };

  return (
    <div className="h-screen bg-gray-100 dark:bg-dark-bg font-sans text-gray-800 dark:text-gray-200 flex overflow-hidden">
      <div className="w-full flex bg-white dark:bg-gray-800">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          categories={sidebarCategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onReorder={handleReorderCategories}
          onAddCategoryClick={() => setIsAddCategoryModalOpen(true)}
          onRenameCategoryClick={(category) => setCategoryToRename(category)}
          onDeleteCategoryClick={(category) => setCategoryToDelete(category)}
        />
        <div className={`flex-1 flex flex-col overflow-hidden relative bg-gray-50 dark:bg-gray-900/50 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-[calc(100%-5rem)]' : 'w-[calc(100%-16rem)]'}`}>
          {isLinksView && (
              <Header
                  viewMode={viewMode} setViewMode={setViewMode}
                  onAddClick={() => setIsAddModalOpen(true)}
                  isDeleteModeActive={isDeleteModeActive} toggleDeleteMode={toggleDeleteMode}
                  onRefresh={runHealthChecks} isRefreshing={isRefreshing}
                  theme={theme} toggleTheme={toggleTheme}
                  isSidebarCollapsed={isSidebarCollapsed}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
              />
          )}
          <main key={selectedCategory} className={`flex-1 overflow-y-auto animate-fade-in px-4 sm:px-6 lg:px-8 py-8 ${showDeleteBar ? 'pb-24' : ''}`}>
              {renderMainContent()}
          </main>
          
          {showDeleteBar && (
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-20 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{selectedLinkIds.length} item(s) selected</span>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedLinkIds([])} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                        <button onClick={() => setIsConfirmBulkDeleteOpen(true)} className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">Delete Selected</button>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
      
      {isLinksView && isAddModalOpen && <AddLinkModal categories={Object.keys(categorizedLinks)} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveNewLink}/>}
      {isLinksView && editingLink && <EditLinkModal link={editingLink} categories={Object.keys(categorizedLinks)} onClose={() => setEditingLink(null)} onSave={handleUpdateLink}/>}
      {isLinksView && isConfirmBulkDeleteOpen && <ConfirmBulkDeleteModal linksToDelete={allLinks.filter(link => selectedLinkIds.includes(link.id))} onClose={() => setIsConfirmBulkDeleteOpen(false)} onConfirm={handleConfirmBulkDelete}/>}
      {isLinksView && isCommandPaletteOpen && <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} links={allLinks} onAddLink={() => { setIsCommandPaletteOpen(false); setIsAddModalOpen(true); }} onToggleDeleteMode={() => { setIsCommandPaletteOpen(false); toggleDeleteMode(); }} onSetViewMode={(mode) => { setIsCommandPaletteOpen(false); setViewMode(mode); }} />}
      
      {isAddCategoryModalOpen && <AddCategoryModal onClose={() => setIsAddCategoryModalOpen(false)} onSave={handleAddCategory} />}
      {categoryToRename && <RenameCategoryModal categoryName={categoryToRename} onClose={() => setCategoryToRename(null)} onSave={(newName) => handleRenameCategory(categoryToRename, newName)} />}
      {categoryToDelete && <ConfirmDeleteCategoryModal categoryName={categoryToDelete} linkCount={allLinks.filter(l => l.category === categoryToDelete).length} onClose={() => setCategoryToDelete(null)} onConfirm={handleDeleteCategory}/>}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;