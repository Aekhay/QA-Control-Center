import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LinkItem, CategorizedLinks, TestDataSet, HealthStatus, ApiEnvironment, ChromeProfile } from './types';
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
import ProfileManagerView from './components/ProfileManagerView';
import OpenWithProfileModal from './components/OpenWithProfileModal';
import * as api from './api';
import { DEFAULT_API_ENVIRONMENTS } from './environments';

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
  const [toast, setToast] = useState<{ message: string; type: 'found' | 'not_found' | 'warning' | 'success' } | null>(null);

  // API environments are now read from a static file
  const [apiEnvironments] = useState<ApiEnvironment[]>(DEFAULT_API_ENVIRONMENTS);

  // State for Chrome Profiles
  const [chromeProfiles, setChromeProfiles] = useState<ChromeProfile[]>([]);
  const [openWithProfileInfo, setOpenWithProfileInfo] = useState<{ profileName: string; url: string } | null>(null);
  
  // State for Sidebar category re-ordering
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  const isLinksView = !['Test Data', 'Quick Tools', 'Chrome Profiles'].includes(selectedCategory);

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
      
      // Load chrome profiles from localStorage
      const storedProfiles = localStorage.getItem('chromeProfiles');
      setChromeProfiles(storedProfiles ? JSON.parse(storedProfiles) : []);

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
  
  // Persist chrome profiles to localStorage
  useEffect(() => {
    localStorage.setItem('chromeProfiles', JSON.stringify(chromeProfiles));
  }, [chromeProfiles]);
  
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

  const handleOpenWithProfile = (url: string, profileName: string) => {
    navigator.clipboard.writeText(url).then(() => {
        setOpenWithProfileInfo({ url, profileName });
    }).catch(err => {
        console.error('Failed to copy for profile: ', err);
        setToast({ message: "Failed to copy URL.", type: 'warning' });
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
  
  // Chrome Profile Handlers
  const handleAddProfile = (newProfileData: Omit<ChromeProfile, 'id'>) => {
    const profileWithId = { ...newProfileData, id: Date.now().toString() };
    setChromeProfiles(prev => [...prev, profileWithId]);
    setToast({ message: `Profile "${profileWithId.name}" added.`, type: 'success' });
  };
  
  const handleUpdateProfile = (updatedProfile: ChromeProfile) => {
    setChromeProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    setToast({ message: `Profile "${updatedProfile.name}" updated.`, type: 'success' });
  };
  
  const handleDeleteProfile = (id: string) => {
    if (window.confirm("Are you sure you want to delete this profile? This cannot be undone.")) {
        setChromeProfiles(prev => prev.filter(p => p.id !== id));
        setToast({ message: "Profile deleted.", type: 'success' });
    }
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
    const allCurrentCats = ['All', ...dynamicCategories, 'Test Data', 'Quick Tools', 'Chrome Profiles'];
  
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
    if (sorted.length !== categoryOrder.length) {
      setCategoryOrder(sorted);
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
        <div className="text-center py-16"><h2 className="text-2xl font-semibold text-gray-400">Loading links...</h2></div>
      ) : hasResults ? (
         Object.entries(filteredLinks).map(([category, links]) => {
            const section = (
              <CategorySection
                key={category} category={category} links={links} viewMode={viewMode}
                onEdit={setEditingLink} isDeleteModeActive={isDeleteModeActive}
                selectedLinkIds={selectedLinkIds} onSelect={handleSelectLink}
                showCategoryTitle={selectedCategory === 'All'}
                animationStartIndex={animationCounter}
                chromeProfiles={chromeProfiles}
                onCopyToClipboard={handleCopyToClipboard}
                onOpenWithProfile={handleOpenWithProfile}
              />
            );
            animationCounter += links.length;
            return section;
         })
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-400">No results found</h2>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter.</p>
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

    if (selectedCategory === 'Chrome Profiles') {
      return (
          <ProfileManagerView
              profiles={chromeProfiles}
              onAdd={handleAddProfile}
              onUpdate={handleUpdateProfile}
              onDelete={handleDeleteProfile}
          />
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-200 flex justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-screen-xl flex bg-gray-800 rounded-xl shadow-2xl shadow-black/30 overflow-hidden">
        <Sidebar
          categories={sidebarCategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onReorder={handleReorderCategories}
        />
        <div className="flex-1 flex flex-col overflow-hidden relative bg-gray-900">
          {isLinksView && (
              <Header
                  viewMode={viewMode} setViewMode={setViewMode}
                  onAddClick={() => setIsAddModalOpen(true)}
                  isDeleteModeActive={isDeleteModeActive} toggleDeleteMode={toggleDeleteMode}
                  onRefresh={runHealthChecks} isRefreshing={isRefreshing}
              />
          )}
          <main key={selectedCategory} className={`flex-1 overflow-y-auto animate-fade-in px-4 sm:px-6 lg:px-8 py-8 ${showDeleteBar ? 'pb-24' : ''}`}>
              {renderMainContent()}
          </main>
          
          {isLinksView && showDeleteBar && (
            <div className="absolute bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm z-20 border-t border-gray-700">
                <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <span className="font-medium text-gray-300">{selectedLinkIds.length} item(s) selected</span>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedLinkIds([])} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 text-gray-100 hover:bg-gray-500 transition-colors">Cancel</button>
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
      {openWithProfileInfo && (
        <OpenWithProfileModal 
          profileName={openWithProfileInfo.profileName}
          url={openWithProfileInfo.url}
          onClose={() => setOpenWithProfileInfo(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;