import React, { useState, useEffect } from 'react';
import CheckSiblingsModal from './CheckSiblingsModal';
import SkuSearchModal from './SkuSearchModal';
import { ApiEnvironment } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from '../constants';
import ApiEnvModal from './ApiEnvModal';

interface QuickToolsViewProps {
    apiEnvironments: ApiEnvironment[];
    onAdd: (env: Omit<ApiEnvironment, 'id'>) => Promise<void>;
    onUpdate: (env: ApiEnvironment) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const QuickToolsView: React.FC<QuickToolsViewProps> = ({ apiEnvironments, onAdd, onUpdate, onDelete }) => {
    const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
    const [editingEnv, setEditingEnv] = useState<ApiEnvironment | null>(null);
    
    // State for the tools
    const [siblingSku, setSiblingSku] = useState('');
    const [searchSku, setSearchSku] = useState('');
    const [selectedEnvId, setSelectedEnvId] = useState<string>(apiEnvironments[0]?.id || '');

    const [isSiblingResultsModalOpen, setIsSiblingResultsModalOpen] = useState(false);
    const [isSkuSearchModalOpen, setIsSkuSearchModalOpen] = useState(false);


    useEffect(() => {
        // Set a default selected environment if one isn't set or if the selected one is deleted
        if (apiEnvironments.length > 0 && !apiEnvironments.some(e => e.id === selectedEnvId)) {
            setSelectedEnvId(apiEnvironments[0].id);
        } else if (apiEnvironments.length === 0) {
            setSelectedEnvId('');
        }
    }, [apiEnvironments, selectedEnvId]);


    const handleSaveEnv = (envData: Omit<ApiEnvironment, 'id'>) => {
        if (editingEnv) {
            onUpdate({ ...editingEnv, ...envData });
        } else {
            onAdd(envData);
        }
        setEditingEnv(null);
        setIsEnvModalOpen(false);
    };

    const handleDeleteEnv = (id: string) => {
        if (window.confirm("Are you sure you want to delete this environment?")) {
            onDelete(id);
        }
    };

    const handleOpenEditModal = (env: ApiEnvironment) => {
        setEditingEnv(env);
        setIsEnvModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setEditingEnv(null);
        setIsEnvModalOpen(true);
    };

    const handleCheckSiblingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (siblingSku.trim() && selectedEnvId) {
            setIsSiblingResultsModalOpen(true);
        }
    };

    const handleSkuSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchSku.trim() && selectedEnvId) {
            setIsSkuSearchModalOpen(true);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-6">Quick Tools</h2>
            
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Sibling SKU Checker</h3>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <form onSubmit={handleCheckSiblingsSubmit} className="flex">
                         <input
                            type="text"
                            value={siblingSku}
                            onChange={(e) => setSiblingSku(e.target.value)}
                            placeholder="Enter main SKU..."
                            className="relative block w-full rounded-l-md border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            required
                            disabled={apiEnvironments.length === 0}
                        />
                        <select
                            value={selectedEnvId}
                            onChange={(e) => setSelectedEnvId(e.target.value)}
                            className="-ml-px block rounded-none border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            disabled={apiEnvironments.length === 0}
                        >
                            {apiEnvironments.length === 0 ? (
                                <option>No environments configured</option>
                            ) : (
                                apiEnvironments.map(env => (
                                    <option key={env.id} value={env.id}>{env.name}</option>
                                ))
                            )}
                        </select>
                        <button
                            type="submit"
                            disabled={!siblingSku.trim() || apiEnvironments.length === 0}
                            className="-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            Check Siblings
                        </button>
                    </form>
                </div>
            </section>

            <section className="mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">SKU Search</h3>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <form onSubmit={handleSkuSearchSubmit} className="flex">
                         <input
                            type="text"
                            value={searchSku}
                            onChange={(e) => setSearchSku(e.target.value)}
                            placeholder="Enter SKU..."
                            className="relative block w-full rounded-l-md border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            required
                            disabled={apiEnvironments.length === 0}
                        />
                        <select
                            value={selectedEnvId}
                            onChange={(e) => setSelectedEnvId(e.target.value)}
                            className="-ml-px block rounded-none border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            disabled={apiEnvironments.length === 0}
                        >
                            {apiEnvironments.length === 0 ? (
                                <option>No environments configured</option>
                            ) : (
                                apiEnvironments.map(env => (
                                    <option key={env.id} value={env.id}>{env.name}</option>
                                ))
                            )}
                        </select>
                        <button
                            type="submit"
                            disabled={!searchSku.trim() || apiEnvironments.length === 0}
                            className="-ml-px relative inline-flex items-center space-x-2 rounded-r-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">API Environments</h3>
                    <button onClick={handleOpenAddModal} className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent transition-colors">
                        <PlusIcon className="w-4 h-4" /> Add Environment
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    {apiEnvironments.length > 0 ? (
                        <ul className="divide-y divide-slate-200">
                            {apiEnvironments.map(env => (
                                <li key={env.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-slate-800">{env.name}</p>
                                        <p className="text-sm text-slate-500 truncate max-w-xs sm:max-w-md">{env.url}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleOpenEditModal(env)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteEnv(env.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-6 text-center text-slate-500">No API environments configured. Add one to get started with your tools.</p>
                    )}
                </div>
            </section>

            {isSiblingResultsModalOpen && (
                <CheckSiblingsModal 
                    onClose={() => setIsSiblingResultsModalOpen(false)} 
                    apiEnvironments={apiEnvironments}
                    skuToSearch={siblingSku}
                    selectedEnvId={selectedEnvId}
                />
            )}
             {isSkuSearchModalOpen && (
                <SkuSearchModal 
                    onClose={() => setIsSkuSearchModalOpen(false)} 
                    apiEnvironments={apiEnvironments}
                    skuToSearch={searchSku}
                    selectedEnvId={selectedEnvId}
                />
            )}
            {isEnvModalOpen && (
                <ApiEnvModal
                    onClose={() => setIsEnvModalOpen(false)}
                    onSave={handleSaveEnv}
                    environmentToEdit={editingEnv}
                />
            )}
        </div>
    );
};

export default QuickToolsView;
