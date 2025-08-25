import React, { useEffect } from 'react';
import { AlertTriangleIcon, CheckCircleIcon, CloseIcon } from '../constants';

interface ToastProps {
  message: string;
  type: 'found' | 'not_found' | 'warning' | 'success';
  onClose: () => void;
}

const toastConfig = {
    found: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        iconColor: 'text-red-600',
        title: 'Warning: SKU in use',
        Icon: AlertTriangleIcon
    },
    not_found: {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-500',
        iconColor: 'text-green-600',
        title: 'Success: SKU available',
        Icon: CheckCircleIcon
    },
    warning: {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500',
        iconColor: 'text-yellow-600',
        title: 'System Alert',
        Icon: AlertTriangleIcon
    },
    success: {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        iconColor: 'text-blue-600',
        title: 'Success',
        Icon: CheckCircleIcon
    }
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const config = toastConfig[type] || toastConfig.warning;
  const { bgColor, borderColor, iconColor, title, Icon } = config;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 w-full max-w-sm rounded-lg shadow-lg border-l-4 ${bgColor} ${borderColor} animate-slide-in-up`}
      role="alert"
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconColor}`}>
            <Icon className="w-6 h-6" />
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
