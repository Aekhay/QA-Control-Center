import React, { useState } from 'react';
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
}

const HealthStatusIndicator: React.FC<{ status: HealthStatus }> = ({ status }) => {
    const baseClasses = "w-2.5 h-2.5 rounded-full";
    const statusMap = {
        idle: "hidden",
        checking: `${baseClasses} bg-slate-400 animate-pulse`,
        online: `${baseClasses} bg-green-500`,
        offline: `${baseClasses} bg-red-500`,
    };
    return <div className={statusMap[status]} title={`Status: ${status}`}></div>;
};


const LinkCard: React.FC<LinkCardProps> = ({ link, viewMode, onEdit, isDeleteModeActive, isSelected, onSelect, animationIndex }) => {
  const [isCopied, setIsCopied] = useState(false);
    
  const gridBaseClasses = "group bg-white p-4 rounded-lg shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all duration-300 flex items-center border border-slate-200 border-t-4 border-t-indigo-500";
  const listBaseClasses = "group bg-white px-4 py-2 rounded-md flex items-center border-b border-slate-200";

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

  const handleCopy = () => {
    navigator.clipboard.writeText(link.url).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
  };
    
  const cardContent = (
    <>
      {isDeleteModeActive && (
        <div className="flex-shrink-0 mr-4">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
              isSelected
                ? 'bg-indigo-600'
                : 'bg-slate-200 border border-slate-300'
            }`}
          >
            {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col truncate mr-2">
        <div className="flex items-center gap-2">
            {link.healthStatus && <HealthStatusIndicator status={link.healthStatus} />}
            <span className="font-medium text-slate-800 truncate">{link.name}</span>
        </div>
        {viewMode === 'list' && (
             <span className="text-sm text-slate-500 truncate">{link.url}</span>
        )}
      </div>
      <div className="flex items-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
            onClick={(e) => handleActionClick(e, () => onEdit(link))}
            className="p-2 text-slate-400 rounded-full hover:bg-slate-100 hover:text-indigo-500 transition-colors"
            aria-label={`Edit ${link.name}`}
        >
            <PencilIcon className="w-4 h-4" />
        </button>
        <button
            onClick={(e) => handleActionClick(e, handleCopy)}
            className="p-2 text-slate-400 rounded-full hover:bg-slate-100 hover:text-indigo-500 transition-colors"
            aria-label={`Copy link for ${link.name}`}
        >
            {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
        </button>
        <ExternalLinkIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors ml-1" />
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