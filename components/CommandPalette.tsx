import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LinkItem } from '../types';
import { CommandIcon, CornerDownLeftIcon, PlusIcon, TrashIcon, GridViewIcon, ListViewIcon, ExternalLinkIcon } from '../constants';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  links: LinkItem[];
  onAddLink: () => void;
  onToggleDeleteMode: () => void;
  onSetViewMode: (mode: 'grid' | 'list') => void;
}

type CommandAction = {
    id: string;
    name: string;
    icon: JSX.Element;
    perform: () => void;
    category: 'Actions';
};

type CommandLink = LinkItem;

type Command = CommandAction | CommandLink;

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  links,
  onAddLink,
  onToggleDeleteMode,
  onSetViewMode,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const actions: CommandAction[] = useMemo(() => [
    { id: 'add', name: 'Create a new link...', icon: <PlusIcon className="w-5 h-5"/>, perform: onAddLink, category: 'Actions' },
    { id: 'delete', name: 'Toggle delete mode', icon: <TrashIcon className="w-5 h-5"/>, perform: onToggleDeleteMode, category: 'Actions' },
    { id: 'grid', name: 'Switch to Grid View', icon: <GridViewIcon className="w-5 h-5"/>, perform: () => onSetViewMode('grid'), category: 'Actions' },
    { id: 'list', name: 'Switch to List View', icon: <ListViewIcon className="w-5 h-5"/>, perform: () => onSetViewMode('list'), category: 'Actions' },
  ], [onAddLink, onToggleDeleteMode, onSetViewMode]);

  const filteredCommands = useMemo((): Command[] => {
    const lowercasedQuery = query.toLowerCase();
    
    if (!lowercasedQuery) {
        return [...actions, ...links];
    }

    const filteredLinks = links.filter(link =>
      link.name.toLowerCase().includes(lowercasedQuery) ||
      link.content.toLowerCase().includes(lowercasedQuery) ||
      link.category.toLowerCase().includes(lowercasedQuery)
    );

    const filteredActions = actions.filter(action =>
        action.name.toLowerCase().includes(lowercasedQuery)
    );

    return [...filteredActions, ...filteredLinks];
  }, [query, links, actions]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          handleItemClick(command);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  useEffect(() => {
    // Scroll selected item into view
    const selectedElement = resultsRef.current?.children[selectedIndex] as HTMLElement;
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleItemClick = (command: Command) => {
    if ('perform' in command) {
        command.perform();
    } else if (command.type === 'url') {
        window.open(command.content, '_blank');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" aria-modal="true" role="dialog">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 w-full max-w-xl rounded-lg shadow-2xl mx-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <CommandIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
            }}
            placeholder="Search links or type a command..."
            className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-900 dark:text-gray-200 focus:outline-none text-lg"
          />
        </div>
        <hr className="border-gray-200 dark:border-gray-700" />
        <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto p-2">
            {filteredCommands.length > 0 ? (
                filteredCommands.map((command, index) => {
                    const isSelected = index === selectedIndex;
                    const isAction = 'perform' in command;
                    return (
                        <div
                            key={isAction ? command.id : command.id}
                            onClick={() => handleItemClick(command)}
                            className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                                isSelected ? 'bg-sky-100 dark:bg-sky-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <div className="text-gray-500">
                                    {isAction ? command.icon : <ExternalLinkIcon className="w-5 h-5"/>}
                                </div>
                                <div className="truncate">
                                    <span className={`font-medium ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                        {command.name}
                                    </span>
                                    {!isAction && (
                                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{command.category}</span>
                                    )}
                                </div>
                            </div>
                            {isSelected && <CornerDownLeftIcon className="w-5 h-5 text-gray-500 flex-shrink-0"/>}
                        </div>
                    );
                })
            ) : (
                <div className="p-4 text-center text-gray-500">
                    No results found.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;