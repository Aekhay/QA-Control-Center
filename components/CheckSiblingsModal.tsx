import React, { useState, useEffect } from 'react';
import { CloseIcon, CopyIcon } from '../constants';
import { SiblingApiResponse } from '../types';

interface CheckSiblingsModalProps {
    onClose: () => void;
}

const CheckSiblingsModal: React.FC<CheckSiblingsModalProps> = ({ onClose }) => {
    const [sku, setSku] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sku.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult(null);
        setCopySuccess(false);

        try {
            const targetUrl = `https://www.ounass.ae/product/findbysku?sku=${sku.trim()}&_fields=siblings`;
            // Switched to a more stable CORS proxy to avoid 403 errors
            const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
            
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                 if (response.status === 404) {
                    throw new Error(`API Error: SKU ${sku.trim()} not found.`);
                }
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }

            const data: SiblingApiResponse = await response.json();

            if (data.siblings && data.siblings.length > 0) {
                setResult(data.siblings);
            } else {
                setError(`No siblings found for SKU ${sku.trim()}.`);
            }
        } catch (err: any) {
            console.error("Sibling fetch error:", err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

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
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">Check Sibling SKUs</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close modal">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
                    <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="Enter main SKU..."
                        className="flex-grow px-3 py-2 bg-slate-100 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                <div className="min-h-[150px]">
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
                                                    {sku}
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