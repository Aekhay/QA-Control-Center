import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../constants';
import { ApiEnvironment } from '../types';
import JsonTreeView from './JsonTreeView';

interface CheckSiblingsModalProps {
    onClose: () => void;
    apiEnvironments: ApiEnvironment[];
    skuToSearch: string;
    selectedEnvId: string;
}

const CheckSiblingsModal: React.FC<CheckSiblingsModalProps> = ({ onClose, apiEnvironments, skuToSearch, selectedEnvId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any | null>(null);

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

            if (!selectedEnv.url.includes('{{sku}}')) {
                setError(`The URL for environment "${selectedEnv.name}" is not configured correctly. It must contain the {{sku}} placeholder.`);
                setIsLoading(false);
                return;
            }

            let responseText = '';
            try {
                const targetUrl = selectedEnv.url.replace('{{sku}}', skuToSearch.trim());
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
                
                const response = await fetch(proxyUrl);
                responseText = await response.text();

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`API Error: SKU ${skuToSearch.trim()} not found on ${selectedEnv.name}. The server returned a 404 status.`);
                    }
                    throw new Error(`Network request failed. Status: ${response.status}. Raw response: ${responseText.substring(0, 200)}`);
                }
                
                const data: any = JSON.parse(responseText);
                
                let siblings: string[] | undefined;
                if (data.siblings && Array.isArray(data.siblings)) {
                    siblings = data.siblings;
                } else if (data._source?.siblings && Array.isArray(data._source.siblings)) {
                    siblings = data._source.siblings;
                }

                if (siblings) {
                    const formattedResult = {
                        "SKU Information": {
                            "main_sku": skuToSearch,
                            "sibling_count": siblings.length,
                        },
                        "Siblings List": siblings.reduce((acc, sibling, index) => {
                            acc[`sibling_${index + 1}`] = sibling;
                            return acc;
                        }, {} as Record<string, string>)
                    };
                    setResult(formattedResult);
                } else {
                    const formattedResult = {
                         "Search Details": {
                            "searched_sku": skuToSearch,
                            "message": "No 'siblings' array was found in the API response.",
                            "tip": "The raw API response is shown below for debugging."
                        },
                        "Full API Response": data
                    };
                    setResult(formattedResult);
                }
            } catch (err: any) {
                console.error("Sibling fetch error:", err);
                 if (err instanceof SyntaxError) {
                    setError(`Failed to parse the API response as JSON. The endpoint may be returning an HTML error page or invalid data. Raw response snippet: "${responseText.substring(0, 150)}..."`);
                } else {
                    setError(err.message || 'An unexpected error occurred.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchSiblings();
    }, [skuToSearch, selectedEnvId, apiEnvironments]);
    
    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full max-w-4xl m-4 relative flex flex-col h-[90vh]">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sibling SKU Results for "{skuToSearch}"</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close modal">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-1 min-h-0 flex flex-col bg-gray-50 dark:bg-gray-900/50 p-4">
                    {isLoading && <p className="text-center text-gray-500 dark:text-gray-400 py-10">Fetching sibling data...</p>}
                    
                    {error && (
                        <div className="m-auto p-4 text-center text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-500/50 rounded-md">
                            <h3 className="font-bold mb-2">An Error Occurred</h3>
                            <p className="text-sm font-mono break-all">{error}</p>
                        </div>
                    )}
                    
                    {result && (
                       <JsonTreeView data={result} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckSiblingsModal;