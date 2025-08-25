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
import * as api from './api';

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

  // State for Quick Tools API Environments
  const [apiEnvironments, setApiEnvironments] = useState<ApiEnvironment[]>([]);

  const isLinksView = !['Test Data', 'Quick Tools'].includes(selectedCategory);

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


  // Data loading from backend
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [linksData, testData, apiEnvs] = await Promise.all([
          api.getLinks(),
          api.getTestDataSets(),
          api.getApiEnvironments(),
        ]);
        
        setAllLinks(linksData || []);
        setTestDataSets(testData || []);
        setApiEnvironments(apiEnvs || []);

        if (testData && testData.length > 0) {
            setActiveDataSetId(testData[0].id);
        }
        
      } catch (error) {
        console.error("Error loading initial data:", error);
        setToast({ message: "Failed to load data from the backend. Using local fallback for links.", type: 'warning' });
        try {
            const response = await fetch('/links.json');
            if (!response.ok) throw new Error('Local links.json not found');
            const localLinks: Omit<LinkItem, 'id' | 'healthStatus'>[] = await response.json();
            const linksWithIds = localLinks.map(link => ({
                ...link,
                id: crypto.randomUUID(),
            }));
            setAllLinks(linksWithIds);
        } catch (fallbackError) {
            console.error("Error loading fallback links:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);
  
  // Initial Health Check
  useEffect(() => {
    if (allLinks.length > 0) {
        runHealthChecks();
    }
  }, [allLinks.length]); // Depends on the number of links to run once
  
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

  const handleUpdateLink = async (updatedLink: LinkItem) => {
    try {
      const savedLink = await api.updateLink(updatedLink);
      setAllLinks(allLinks.map(link => link.id === savedLink.id ? savedLink : link));
      setToast({ message: "Link updated successfully.", type: 'success' });
    } catch (error) {
      console.error("Error updating link:", error);
      setToast({ message: "Failed to update link.", type: 'warning' });
    } finally {
      setEditingLink(null);
    }
  };
  
  const handleSaveNewLink = async (newLinkData: Omit<LinkItem, 'id'>) => {
    try {
      const savedLink = await api.addLink(newLinkData);
      setAllLinks(prevLinks => [...prevLinks, savedLink]);
      setIsAddModalOpen(false);
      setToast({ message: "Link added successfully.", type: 'success' });
    } catch (error) {
      console.error("Error adding new link:", error);
      setToast({ message: "Failed to save the new link.", type: 'warning' });
    }
  };
  
  const handleConfirmBulkDelete = async () => {
    try {
        await api.deleteLinks(selectedLinkIds);
        setAllLinks(allLinks.filter(link => !selectedLinkIds.includes(link.id)));
        setToast({ message: `${selectedLinkIds.length} link(s) deleted.`, type: 'success' });
    } catch (error) {
        console.error("Error deleting links:", error);
        setToast({ message: "Failed to delete links.", type: 'warning' });
    } finally {
        setIsConfirmBulkDeleteOpen(false);
        setSelectedLinkIds([]);
        setIsDeleteModeActive(false);
    }
  };
  
  // Test Data Handlers
  const handleAddTestDataSet = async (newDataSet: Omit<TestDataSet, 'id'>) => {
      try {
          const savedDataSet = await api.addTestDataSet(newDataSet);
          setTestDataSets(prev => [...prev, savedDataSet]);
          if (testDataSets.length === 0) setActiveDataSetId(savedDataSet.id);
          setToast({ message: "Test data set uploaded.", type: 'success' });
      } catch (error) {
          console.error("Error adding test data set:", error);
          setToast({ message: "Failed to upload test data.", type: 'warning' });
      }
  };

  const handleDeleteTestDataSet = async (id: string) => {
      try {
          await api.deleteTestDataSet(id);
          const updatedDataSets = testDataSets.filter(ds => ds.id !== id);
          setTestDataSets(updatedDataSets);
          if (activeDataSetId === id) {
              setActiveDataSetId(updatedDataSets.length > 0 ? updatedDataSets[0].id : null);
          }
          setToast({ message: "Test data set deleted.", type: 'success' });
      } catch (error) {
          console.error("Error deleting test data set:", error);
          setToast({ message: "Failed to delete test data.", type: 'warning' });
      }
  };

  // API Environment Handlers
  const handleAddApiEnv = async (envData: Omit<ApiEnvironment, 'id'>) => {
    try {
      const newEnv = await api.addApiEnvironment(envData);
      setApiEnvironments(prev => [...prev, newEnv]);
      setToast({ message: "API Environment added.", type: 'success' });
    } catch (error) {
      console.error("Error adding API environment:", error);
      setToast({ message: "Failed to add environment.", type: 'warning' });
    }
  };

  const handleUpdateApiEnv = async (envData: ApiEnvironment) => {
    try {
      const updatedEnv = await api.updateApiEnvironment(envData);
      setApiEnvironments(prev => prev.map(e => e.id === updatedEnv.id ? updatedEnv : e));
      setToast({ message: "API Environment updated.", type: 'success' });
    } catch (error) {
      console.error("Error updating API environment:", error);
      setToast({ message: "Failed to update environment.", type: 'warning' });
    }
  };
  
  const handleDeleteApiEnv = async (id: string) => {
    try {
      await api.deleteApiEnvironment(id);
      setApiEnvironments(prev => prev.filter(e => e.id !== id));
      setToast({ message: "API Environment deleted.", type: 'success' });
    } catch (error) {
      console.error("Error deleting API environment:", error);
      setToast({ message: "Failed to delete environment.", type: 'warning' });
    }
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
      const category = link.category || 'Uncategorized';
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
    return ['Sites', ...Object.keys(categorizedLinks).filter(c => c !== 'Sites'), 'Test Data', 'Quick Tools'];
  }, [categorizedLinks]);

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
        <div className="text-center py-16"><h2 className="text-2xl font-semibold text-slate-600">Loading links...</h2></div>
      ) : hasResults ? (
         Object.entries(filteredLinks).map(([category, links]) => {
            const section = (
              <CategorySection
                key={category} category={category} links={links} viewMode={viewMode}
                onEdit={setEditingLink} isDeleteModeActive={isDeleteModeActive}
                selectedLinkIds={selectedLinkIds} onSelect={handleSelectLink}
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
                onAdd={handleAddApiEnv}
                onUpdate={handleUpdateApiEnv}
                onDelete={handleDeleteApiEnv}
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
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-20 border-t border-slate-200">
                <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <span className="font-medium text-slate-700">{selectedLinkIds.length} item(s) selected</span>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedLinkIds([])} className="px-4 py-2 rounded-md text-sm font-medium bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors">Cancel</button>
                        <button onClick={() => setIsConfirmBulkDeleteOpen(true)} className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">Delete Selected</button>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
      
      {isLinksView && isAddModalOpen && <AddLinkModal categories={Object.keys(categorizedLinks)} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveNewLink}/>}
      {isLinksView && editingLink && <EditLinkModal link={editingLink} onClose={() => setEditingLink(null)} onSave={handleUpdateLink}/>}
      {isLinksView && isConfirmBulkDeleteOpen && <ConfirmBulkDeleteModal linksToDelete={allLinks.filter(link => selectedLinkIds.includes(link.id))} onClose={() => setIsConfirmBulkDeleteOpen(false)} onConfirm={handleConfirmBulkDelete}/>}
      {isLinksView && isCommandPaletteOpen && <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} links={allLinks} onAddLink={() => { setIsCommandPaletteOpen(false); setIsAddModalOpen(true); }} onToggleDeleteMode={() => { setIsCommandPaletteOpen(false); toggleDeleteMode(); }} onSetViewMode={(mode) => { setIsCommandPaletteOpen(false); setViewMode(mode); }} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
