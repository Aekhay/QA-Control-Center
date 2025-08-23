import React, { useEffect } from 'react';
import { AlertTriangleIcon, CheckCircleIcon, CloseIcon } from '../constants';

interface ToastProps {
  message: string;
  type: 'found' | 'not_found';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const isFound = type === 'found';
  const bgColor = isFound ? 'bg-amber-100' : 'bg-green-100';
  const borderColor = isFound ? 'border-amber-500' : 'border-green-500';
  const iconColor = isFound ? 'text-amber-600' : 'text-green-600';
  const title = isFound ? 'Warning: SKU in use' : 'Success: SKU available';

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 w-full max-w-sm rounded-lg shadow-lg border-l-4 ${bgColor} ${borderColor} animate-slide-in-up`}
      role="alert"
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconColor}`}>
          {isFound ? (
            <AlertTriangleIcon className="w-6 h-6" />
          ) : (
            <CheckCircleIcon className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{title}</p>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 -m-1 rounded-full text-slate-500 hover:bg-black/10"
          aria-label="Dismiss"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
