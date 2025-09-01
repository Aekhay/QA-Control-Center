import React, { useEffect } from 'react';
import { CloseIcon, CopyIcon, CheckIcon } from '../constants';

interface OpenWithProfileModalProps {
  profileName: string;
  url: string;
  onClose: () => void;
}

const OpenWithProfileModal: React.FC<OpenWithProfileModalProps> = ({ profileName, url, onClose }) => {
  const [isCopied, setIsCopied] = React.useState(true); // Assume copied on open

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const pasteShortcut = isMac ? '⌘V' : 'Ctrl+V';

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 relative border border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-100">Open in "{profileName}"</h2>
            <p className="text-sm text-gray-400 mt-1">URL has been copied. Follow the steps below.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 -mt-1 rounded-full text-gray-400 hover:bg-gray-700"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4 my-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg">1</div>
            <p className="text-gray-300 pt-1">Manually switch to your <strong className="text-sky-400">{profileName}</strong> Chrome profile window.</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg">2</div>
            <p className="text-gray-300 pt-1">Click the address bar and paste the link using <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-700 border border-gray-600 rounded-md">{pasteShortcut}</kbd>.</p>
          </div>
        </div>

        <div className="bg-gray-900 p-3 rounded-md flex items-center gap-3 border border-gray-700">
            <p className="flex-1 text-sm text-gray-400 truncate font-mono">{url}</p>
            <button
                onClick={handleCopy}
                className="flex-shrink-0 p-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-sky-400 transition-colors"
                aria-label="Copy URL again"
            >
                {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
            </button>
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-md text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenWithProfileModal;