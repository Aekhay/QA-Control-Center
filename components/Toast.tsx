import React, { useEffect } from 'react';
import { AlertTriangleIcon, CheckCircleIcon, CloseIcon } from '../constants';

interface ToastProps {
  message: string;
  type: 'found' | 'not_found' | 'warning' | 'success';
  onClose: () => void;
}

const toastConfig = {
    found: {
        classes: 'bg-red-50 dark:bg-red-900/50 border-red-400 dark:border-red-500',
        iconColor: 'text-red-600',
        title: 'Warning: SKU in use',
        Icon: AlertTriangleIcon
    },
    not_found: {
        classes: 'bg-green-50 dark:bg-green-900/50 border-green-400 dark:border-green-500',
        iconColor: 'text-green-600',
        title: 'Success: SKU available',
        Icon: CheckCircleIcon
    },
    warning: {
        classes: 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-400 dark:border-yellow-500',
        iconColor: 'text-yellow-600',
        title: 'System Alert',
        Icon: AlertTriangleIcon
    },
    success: {
        classes: 'bg-sky-50 dark:bg-sky-900/50 border-sky-400 dark:border-sky-500',
        iconColor: 'text-sky-600',
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
  const { classes, iconColor, title, Icon } = config;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 w-full max-w-sm rounded-lg shadow-2xl border-l-4 backdrop-blur-md ${classes} animate-slide-in-up`}
      role="alert"
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconColor}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 -m-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Dismiss"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;