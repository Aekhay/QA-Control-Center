import React from 'react';
import { LinkItem } from '../types';
import { ExternalLinkIcon } from '../constants';

interface MultiOpenPopupProps {
  selectedLinks: LinkItem[];
  onOpenAll: () => void;
  onCancel: () => void;
}

const MultiOpenPopup: React.FC<MultiOpenPopupProps> = ({ selectedLinks, onOpenAll, onCancel }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-20 border-t border-gray-200 dark:border-gray-700 animate-slide-in-up">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">{selectedLinks.length} link(s) selected</span>
          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md truncate" title={selectedLinks.map(link => link.name).join(', ')}>
            {selectedLinks.map(link => link.name).join(', ')}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">
            Cancel
          </button>
          <button onClick={onOpenAll} className="px-4 py-2 rounded-md text-sm font-medium bg-sky-600 text-white hover:bg-sky-700 transition-colors flex items-center gap-2">
            <ExternalLinkIcon className="w-4 h-4" />
            Open All
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiOpenPopup;
