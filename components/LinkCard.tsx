import React, { useState, useRef, useEffect } from 'react';
import { LinkItem, HealthStatus, ChromeProfile } from '../types';
import { ExternalLinkIcon, PencilIcon, CheckIcon, CopyIcon, BrowserProfileIcon } from '../constants';

interface LinkCardProps {
  link: LinkItem;
  viewMode: 'grid' | 'list';
  onEdit: (link: LinkItem) => void;
  isDeleteModeActive: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  animationIndex: number;
  chromeProfiles: ChromeProfile[];
  onCopyToClipboard: (text: string, message: string) => void;
}

const HealthStatusIndicator: React.FC<{ status: HealthStatus }> = ({ status }) => {
    const baseClasses = "w-2.5 h-2.5 rounded-full";
    const statusMap = {
        idle: "hidden",
        checking: `${baseClasses} bg-slate-500 animate-pulse`,
        online: `${baseClasses} bg-green-500`,
        offline: `${baseClasses} bg-red-500`,
    };
    return <div className={statusMap[status]} title={`Status: ${status}`}></div>;
};


const LinkCard: React.FC<LinkCardProps> = ({ link, viewMode, onEdit, isDeleteModeActive, isSelected, onSelect, animationIndex, chromeProfiles, onCopyToClipboard }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
    
  const gridBaseClasses = "group bg-gray-800 p-4 rounded-lg hover:bg-gray-700/60 hover:scale-[1.03] transition-all duration-300 flex items-center border border-gray-700 border-t-4 border-t-sky-500";
  const listBaseClasses = "group bg-gray-800 px-4 py-2 rounded-md flex items-center border-b border-gray-700 hover:bg-gray-700/60";

  const baseClasses = viewMode === 'grid' ? gridBaseClasses : listBaseClasses;
    
  const cardClasses = `${baseClasses} ${isDeleteModeActive ? 'cursor-pointer' : ''} opacity-0`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

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
  
  const handleProfileClick = (profile: ChromeProfile) => {
    onCopyToClipboard(link.url, `URL copied! Switch to your "${profile.name}" profile and paste.`);
    setIsProfileMenuOpen(false);
  };
    
  const cardContent = (
    <>
      {isDeleteModeActive && (
        <div className="flex-shrink-0 mr-4">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
              isSelected
                ? 'bg-sky-500'
                : 'bg-gray-700 border border-gray-600'
            }`}
          >
            {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col truncate mr-2">
        <div className="flex items-center gap-2">
            {link.healthStatus && <HealthStatusIndicator status={link.healthStatus} />}
            <span className="font-medium text-gray-200 truncate">{link.name}</span>
        </div>
        {viewMode === 'list' && (
             <span className="text-sm text-gray-400 truncate">{link.url}</span>
        )}
      </div>
      <div className="flex items-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {chromeProfiles.length > 0 && (
            <div className="relative">
                <button
                    onClick={(e) => handleActionClick(e, () => setIsProfileMenuOpen(p => !p))}
                    className="p-2 text-gray-500 rounded-full hover:bg-gray-900 hover:text-sky-400 transition-colors"
                    aria-label={`Open with profile for ${link.name}`}
                >
                    <BrowserProfileIcon className="w-4 h-4" />
                </button>
                {isProfileMenuOpen && (
                    <div ref={profileMenuRef} className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-20 animate-fade-in py-1">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 border-b border-gray-700">Open with Profile</div>
                        <ul>
                            {chromeProfiles.map(profile => (
                                <li key={profile.id}>
                                    <button 
                                        onClick={(e) => handleActionClick(e, () => handleProfileClick(profile))}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-sky-500/20"
                                    >
                                        {profile.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )}
        <button
            onClick={(e) => handleActionClick(e, () => onEdit(link))}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-900 hover:text-sky-400 transition-colors"
            aria-label={`Edit ${link.name}`}
        >
            <PencilIcon className="w-4 h-4" />
        </button>
        <button
            onClick={(e) => handleActionClick(e, handleCopyUrl)}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-900 hover:text-sky-400 transition-colors"
            aria-label={`Copy link for ${link.name}`}
        >
            {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
        </button>
        <ExternalLinkIcon className="w-5 h-5 text-gray-500 group-hover:text-sky-400 transition-colors ml-1" />
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
