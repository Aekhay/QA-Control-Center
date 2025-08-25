import React, { useState, useEffect } from 'react';
import CheckSiblingsModal from './CheckSiblingsModal';
import SkuSearchModal from './SkuSearchModal';
import { ApiEnvironment } from '../types';
import { SearchIcon } from '../constants';

interface QuickToolsViewProps {
    apiEnvironments: ApiEnvironment[];
}

const QuickToolsView: React.FC<QuickToolsViewProps> = ({ apiEnvironments }) => {
    // State for the tools
    const [siblingSku, setSiblingSku] = useState('');
    const [searchSku, setSearchSku] = useState('');
    const [selectedEnvId, setSelectedEnvId] = useState<string>(apiEnvironments[0]?.id || '');

    const [isSiblingResultsModalOpen, setIsSiblingResultsModalOpen] = useState(false);
    const [isSkuSearchModalOpen, setIsSkuSearchModalOpen] = useState(false);
    const [viewingEnvId, setViewingEnvId] = useState<string | null>(null);


    useEffect(() => {
        // Set a default selected environment if one isn't set or if the selected one is deleted
        if (apiEnvironments.length > 0 && !apiEnvironments.some(e => e.id === selectedEnvId)) {
            setSelectedEnvId(apiEnvironments[0].id);
        } else if (apiEnvironments.length === 0) {
            setSelectedEnvId('');
        }
    }, [apiEnvironments, selectedEnvId]);


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

    const actionButtonClasses = "-ml-px relative inline-flex items-center justify-center w-36 rounded-r-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 focus:z-10 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-200 tracking-tight mb-6">Quick Tools</h2>
            
            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Sibling SKU Checker</h3>
                <form onSubmit={handleCheckSiblingsSubmit} className="flex items-stretch w-full max-w-lg">
                    <div className="relative flex-grow">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={siblingSku}
                            onChange={(e) => setSiblingSku(e.target.value)}
                            placeholder="Enter main SKU..."
                            className="block w-full rounded-l-md border border-gray-600 bg-gray-900 text-gray-200 py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            required
                            disabled={apiEnvironments.length === 0}
                        />
                    </div>
                    <select
                        value={selectedEnvId}
                        onChange={(e) => setSelectedEnvId(e.target.value)}
                        className="-ml-px block border border-gray-600 bg-gray-800 py-2 pl-3 pr-7 text-sm text-gray-200 focus:z-10 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        disabled={apiEnvironments.length === 0}
                    >
                        {apiEnvironments.length === 0 ? (
                            <option>No environments</option>
                        ) : (
                            apiEnvironments.map(env => (
                                <option key={env.id} value={env.id}>{env.name}</option>
                            ))
                        )}
                    </select>
                    <button
                        type="submit"
                        disabled={!siblingSku.trim() || apiEnvironments.length === 0}
                        className={actionButtonClasses}
                    >
                        Check Siblings
                    </button>
                </form>
            </section>

            <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">SKU Search</h3>
                <form onSubmit={handleSkuSearchSubmit} className="flex items-stretch w-full max-w-lg">
                    <div className="relative flex-grow">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchSku}
                            onChange={(e) => setSearchSku(e.target.value)}
                            placeholder="Enter SKU..."
                            className="block w-full rounded-l-md border border-gray-600 bg-gray-900 text-gray-200 py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            required
                            disabled={apiEnvironments.length === 0}
                        />
                    </div>
                    <select
                        value={selectedEnvId}
                        onChange={(e) => setSelectedEnvId(e.target.value)}
                        className="-ml-px block border border-gray-600 bg-gray-800 py-2 pl-3 pr-7 text-sm text-gray-200 focus:z-10 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        disabled={apiEnvironments.length === 0}
                    >
                        {apiEnvironments.length === 0 ? (
                            <option>No environments</option>
                        ) : (
                            apiEnvironments.map(env => (
                                <option key={env.id} value={env.id}>{env.name}</option>
                            ))
                        )}
                    </select>
                    <button
                        type="submit"
                        disabled={!searchSku.trim() || apiEnvironments.length === 0}
                        className={actionButtonClasses}
                    >
                        Search
                    </button>
                </form>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-200">API Environments</h3>
                </div>
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                    {apiEnvironments.length > 0 ? (
                        <ul className="divide-y divide-gray-700">
                            {apiEnvironments.map(env => (
                                <li key={env.id} className="p-4">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium text-gray-200">{env.name}</p>
                                        <button
                                            onClick={() => setViewingEnvId(viewingEnvId === env.id ? null : env.id)}
                                            className="px-3 py-1 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                                        >
                                            {viewingEnvId === env.id ? 'Hide' : 'View'}
                                        </button>
                                    </div>
                                    {viewingEnvId === env.id && (
                                        <div className="mt-3 bg-gray-900 p-3 rounded-md border border-gray-700 animate-fade-in">
                                            <p className="text-sm text-gray-400 break-all">{env.url}</p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-6 text-center text-gray-500">No API environments configured.</p>
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
        </div>
    );
};

export default QuickToolsView;