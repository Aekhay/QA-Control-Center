import React from 'react';
import { LinkItem } from '../types';
import { ExternalLinkIcon, PencilIcon, CheckIcon } from '../constants';

interface LinkCardProps {
  link: LinkItem;
  viewMode: 'grid' | 'list';
  onEdit: (link: LinkItem) => void;
  isDeleteModeActive: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, viewMode, onEdit, isDeleteModeActive, isSelected, onSelect }) => {
    
  const gridBaseClasses = "group bg-white p-4 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center border border-slate-200";
  const listBaseClasses = "group bg-white px-4 py-2 rounded-md flex items-center border-b border-slate-200";

  const baseClasses = viewMode === 'grid' ? gridBaseClasses : listBaseClasses;
    
  const cardClasses = `${baseClasses} ${isDeleteModeActive ? 'cursor-pointer' : ''}`;

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
    
  const cardContent = (
    <>
      {isDeleteModeActive && (
        <div className="flex-shrink-0 mr-4">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
              isSelected
                ? 'bg-sky-600'
                : 'bg-slate-200 border border-slate-300'
            }`}
          >
            {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col truncate mr-2">
        <span className="font-medium text-slate-700 truncate">{link.name}</span>
        {viewMode === 'list' && (
             <span className="text-xs text-slate-500 truncate">{link.url}</span>
        )}
      </div>
      <div className="flex items-center flex-shrink-0">
        <button
            onClick={(e) => handleActionClick(e, () => onEdit(link))}
            className="p-2 text-slate-400 rounded-full hover:bg-slate-100 hover:text-sky-500 transition-colors"
            aria-label={`Edit ${link.name}`}
        >
            <PencilIcon className="w-4 h-4" />
        </button>
        <ExternalLinkIcon className="w-5 h-5 text-slate-400 group-hover:text-sky-500 transition-colors ml-1" />
      </div>
    </>
  );

  return isDeleteModeActive ? (
    <div onClick={handleContainerClick} className={cardClasses}>
      {cardContent}
    </div>
  ) : (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClasses}
    >
      {cardContent}
    </a>
  );
};

export default LinkCard;