import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '../constants';

interface DropdownProps {
  options: string[];
  selectedOption: string;
  onSelectOption: (option: string) => void;
  placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, selectedOption, onSelectOption, placeholder = "Select an option" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchTerm(selectedOption);
  }, [selectedOption]);

  const handleSelect = (option: string) => {
    onSelectOption(option);
    setIsOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSelectOption(e.target.value); 
  }

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-4 py-2 bg-sky-600 text-white font-semibold rounded-md text-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-sky-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption || placeholder}</span>
        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search or create..."
              value={searchTerm}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              autoFocus
            />
          </div>
          <ul className="max-h-40 overflow-y-auto py-1" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-sky-100 dark:hover:bg-sky-900/50 hover:text-sky-600 dark:hover:text-sky-400 ${selectedOption === option ? 'bg-sky-100 dark:bg-sky-900/50' : ''}`}
                  role="option"
                  aria-selected={selectedOption === option}
                >
                  {option}
                </li>
              ))
            ) : (
                <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No matching categories.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;