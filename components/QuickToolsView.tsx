import React, { useState } from 'react';
import CheckSiblingsModal from './CheckSiblingsModal';

const QuickToolsView: React.FC = () => {
    const [isCheckSiblingsOpen, setIsCheckSiblingsOpen] = useState(false);

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-6">Quick Tools</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium text-slate-800">Sibling SKU Checker</h3>
                        <p className="text-slate-500 mt-1">
                            Enter a main SKU to find all associated sibling SKUs from the live product API.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCheckSiblingsOpen(true)}
                        className="px-4 py-2 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                        Check Siblings
                    </button>
                </div>
            </div>

            {isCheckSiblingsOpen && (
                <CheckSiblingsModal onClose={() => setIsCheckSiblingsOpen(false)} />
            )}
        </div>
    );
};

export default QuickToolsView;