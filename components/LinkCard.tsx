import React, { useState, useRef, useEffect } from 'react';
import { LinkItem, HealthStatus } from '../types';
import { ExternalLinkIcon, PencilIcon, CheckIcon, CopyIcon } from '../constants';

interface LinkCardProps {
  link: LinkItem;
  viewMode: 'grid' | 'list';
  onEdit: (link: LinkItem) => void;
  isDeleteModeActive: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  animationIndex: number;
  onCopyToClipboard: (text: string, message: string) => void;
  isMultiOpenSelected: boolean;
  onMultiOpenSelect: (id: string) => void;
}

const HealthStatusIndicator: React.FC<{ status: HealthStatus }> = ({ status }) => {
    const baseClasses = "w-2.5 h-2.5 rounded-full";
    const statusMap = {
        idle: "hidden",
        checking: `${baseClasses} bg-gray-400 animate-pulse`,
        online: `${baseClasses} bg-green-500`,
        offline: `${baseClasses} bg-red-500`,
    };
    return <div className={statusMap[status]} title={`Status: ${status}`}></div>;
};


const LinkCard: React.FC<LinkCardProps> = ({ link, viewMode, onEdit, isDeleteModeActive, isSelected, onSelect, animationIndex, onCopyToClipboard, isMultiOpenSelected, onMultiOpenSelect }) => {
  const [isCopied, setIsCopied] = useState(false);
    
  const gridBaseClasses = "group bg-white dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 hover:scale-[1.03] transition-all duration-300 flex items-center border border-gray-200 dark:border-gray-600 border-t-4 border-t-sky-500";
  const listBaseClasses = "group bg-white dark:bg-gray-700 px-4 py-2 rounded-md flex items-center border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600";

  const baseClasses = viewMode === 'grid' ? gridBaseClasses : listBaseClasses;
    
  const cardClasses = `${baseClasses} ${isDeleteModeActive ? 'cursor-pointer' : ''} opacity-0`;

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => {
    if (isDeleteModeActive) {
      e.preventDefault();
      onSelect(link.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };
  
  const handleCopyUrl = () => {
    onCopyToClipboard(link.url, `URL for "${link.name}" copied.`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
    
  const cardContent = (
    <>
      {!isDeleteModeActive && (
        <input
            type="checkbox"
            checked={isMultiOpenSelected}
            onChange={() => {}} // onChange is a no-op as onClick handles the logic
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMultiOpenSelect(link.id);
            }}
            className="flex-shrink-0 mr-4 h-5 w-5 rounded border-gray-300 dark:border-gray-500 text-sky-600 focus:ring-sky-500 cursor-pointer bg-gray-100 dark:bg-gray-600"
            aria-label={`Select ${link.name}`}
          />
      )}
      {isDeleteModeActive && (
        <div className="flex-shrink-0 mr-4">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
              isSelected
                ? 'bg-sky-500'
                : 'bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500'
            }`}
          >
            {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col truncate mr-2">
        <div className="flex items-center gap-2">
            {link.healthStatus && <HealthStatusIndicator status={link.healthStatus} />}
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{link.name}</span>
        </div>
        {viewMode === 'list' && (
             <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{link.url}</span>
        )}
      </div>
      <div className="flex items-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
            onClick={(e) => handleActionClick(e, () => onEdit(link))}
            className="p-2 text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-sky-400 transition-colors"
            aria-label={`Edit ${link.name}`}
        >
            <PencilIcon className="w-4 h-4" />
        </button>
        <button
            onClick={(e) => handleActionClick(e, handleCopyUrl)}
            className="p-2 text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-sky-400 transition-colors"
            aria-label={`Copy link for ${link.name}`}
        >
            {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
        </button>
        <ExternalLinkIcon className="w-5 h-5 text-gray-400 group-hover:text-sky-400 transition-colors ml-1" />
      </div>
    </>
  );

  const animationStyle = { animation: `fade-in 0.5s ease-out ${animationIndex * 0.05}s forwards` };

  return isDeleteModeActive ? (
    <div onClick={handleContainerClick} className={cardClasses} style={animationStyle}>
      {cardContent}
    </div>
  ) : (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClasses}
      style={animationStyle}
    >
      {cardContent}
    </a>
  );
};

export default LinkCard;
