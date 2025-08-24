import React, { useState, useEffect } from 'react';
import { CloseIcon, CopyIcon } from '../constants';
import { SiblingApiResponse, ApiEnvironment } from '../types';

interface CheckSiblingsModalProps {
    onClose: () => void;
    apiEnvironments: ApiEnvironment[];
    skuToSearch: string;
    selectedEnvId: string;
}

const CheckSiblingsModal: React.FC<CheckSiblingsModalProps> = ({ onClose, apiEnvironments, skuToSearch, selectedEnvId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string[] | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        const fetchSiblings = async () => {
            setIsLoading(true);
            setError(null);
            setResult(null);

            const selectedEnv = apiEnvironments.find(env => env.id === selectedEnvId);
            if (!selectedEnv) {
                setError("Selected environment not found.");
                setIsLoading(false);
                return;
            }

            try {
                const baseUrl = selectedEnv.url.endsWith('/') ? selectedEnv.url.slice(0, -1) : selectedEnv.url;
                const targetUrl = `${baseUrl}/product/findbysku?sku=${skuToSearch.trim()}&_fields=siblings`;
                const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
                
                const response = await fetch(proxyUrl);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`API Error: SKU ${skuToSearch.trim()} not found on ${selectedEnv.name}.`);
                    }
                    throw new Error(`Network response was not ok. Status: ${response.status}`);
                }

                const data: SiblingApiResponse = await response.json();

                if (data.siblings && data.siblings.length > 0) {
                    setResult(data.siblings);
                } else {
                    setError(`No siblings found for SKU ${skuToSearch.trim()} on ${selectedEnv.name}.`);
                }
            } catch (err: any) {
                console.error("Sibling fetch error:", err);
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSiblings();
    }, [skuToSearch, selectedEnvId, apiEnvironments]);


    const handleCopy = () => {
        if (!result) return;
        const copyText = result.map(s => `"${s}"`).join(',');
        navigator.clipboard.writeText(copyText).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };
    
    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">Sibling SKU Results</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close modal">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="min-h-[200px]">
                    {isLoading && <p className="text-center text-slate-500 py-10">Fetching data...</p>}
                    
                    {error && (
                        <div className="p-3 text-center text-red-700 bg-red-100 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}
                    
                    {result && (
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-slate-700">Results</h3>
                                <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1 text-sm rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200">
                                    <CopyIcon className="w-4 h-4" />
                                    <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>
                            <div className="w-full rounded-lg border border-slate-200 overflow-hidden">
                                <div className="max-h-72 overflow-y-auto relative">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 font-bold text-slate-600 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th scope="col" className="px-6 py-3 font-bold text-slate-600 uppercase tracking-wider">
                                                    SKU
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            <tr className="border-b border-slate-200">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    Main SKU
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {skuToSearch}
                                                </td>
                                            </tr>
                                            {result.map((sibling, index) => (
                                                <tr key={sibling} className={index === result.length - 1 ? '' : 'border-b border-slate-200'}>
                                                    <td className="px-6 py-4 font-medium text-slate-900">
                                                        Sibling {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {sibling}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckSiblingsModal;