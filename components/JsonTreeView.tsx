import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDownIcon } from '../constants';

const JsonTreeView = ({ data: initialData }) => {
    const [data, setData] = useState(initialData?._source || initialData);
    const [fieldSearch, setFieldSearch] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);

    useEffect(() => {
        const sourceData = initialData?._source || initialData;
        setData(sourceData);
        // Automatically expand all sections when new data is loaded
        setExpandedSections(Object.keys(sourceData).filter(key => typeof sourceData[key] === 'object' && sourceData[key] !== null));
    }, [initialData]);
    
    const processedData = useMemo(() => {
        const sections: { [key: string]: any } = {};
        const rootFields: { [key: string]: any } = {};

        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                sections[key] = value;
            } else {
                rootFields[key] = value;
            }
        });
        
        // Group root fields into a 'Details' section if they exist
        if (Object.keys(rootFields).length > 0) {
            return { Details: rootFields, ...sections };
        }
        return sections;

    }, [data]);

    const allFieldKeys = useMemo(() => {
        return [...new Set(Object.values(processedData).flatMap(sectionData => Object.keys(sectionData as object)))];
    }, [processedData]);

    const handleFieldSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setFieldSearch(query);

        if (query.trim()) {
            const lowercasedQuery = query.toLowerCase();
            const filteredKeys = allFieldKeys
                .filter(key => 
                    key.toLowerCase().includes(lowercasedQuery) && 
                    key.toLowerCase() !== lowercasedQuery
                )
                .slice(0, 2);
            setSuggestions(filteredKeys);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setFieldSearch(suggestion);
        setSuggestions([]);
    };
    
    const filteredSections = useMemo(() => {
        if (!fieldSearch) return processedData;
        const lowercasedFilter = fieldSearch.toLowerCase();
        const result: { [key: string]: any } = {};

        Object.entries(processedData).forEach(([sectionTitle, sectionData]) => {
            const filteredData = Object.entries(sectionData).filter(([key]) => key.toLowerCase().includes(lowercasedFilter));
            if (filteredData.length > 0) {
                result[sectionTitle] = Object.fromEntries(filteredData);
            }
        });
        return result;
    }, [fieldSearch, processedData]);

    const toggleSection = (key) => {
        setExpandedSections(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    // --- Toggle Logic ---
    const allVisibleFields = useMemo(() => 
        Object.entries(filteredSections).flatMap(([section, data]) => 
            Object.keys(data).map(key => `${section}.${key}`)
        ), [filteredSections]);

    const allSectionsExpanded = useMemo(() => 
        Object.keys(filteredSections).length > 0 && 
        Object.keys(filteredSections).every(key => expandedSections.includes(key)), 
        [filteredSections, expandedSections]);

    const allFieldsSelected = useMemo(() => 
        allVisibleFields.length > 0 && 
        selectedFields.length === allVisibleFields.length && 
        allVisibleFields.every(field => selectedFields.includes(field)),
        [selectedFields, allVisibleFields]);
    
    const handleToggleSelectAll = () => {
        if (allFieldsSelected) {
            setSelectedFields([]);
        } else {
            setSelectedFields(allVisibleFields);
        }
    };

    const handleToggleExpandAll = () => {
        if (allSectionsExpanded) {
            setExpandedSections([]);
        } else {
            setExpandedSections(Object.keys(filteredSections));
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-gray-900 text-gray-300 rounded-md font-mono text-sm">
            {/* Toolbar */}
            <div className="flex-shrink-0 p-3 bg-gray-800/50 rounded-t-md border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search fields..."
                            value={fieldSearch}
                            onChange={handleFieldSearchChange}
                            onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                         {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-600 border border-gray-500 rounded-md shadow-lg z-10 text-gray-200">
                                {suggestions.map(suggestion => (
                                    <button
                                        key={suggestion}
                                        onMouseDown={() => handleSuggestionClick(suggestion)}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-500 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={handleToggleSelectAll} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md">
                        {allFieldsSelected ? 'Deselect All' : 'Select All'}
                    </button>
                    <button onClick={handleToggleExpandAll} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md">
                        {allSectionsExpanded ? 'Collapse All' : 'Expand All'}
                    </button>
                </div>
            </div>
            {/* Data View */}
            <div className="flex-1 overflow-auto p-3 space-y-2">
                {Object.keys(filteredSections).length > 0 ? Object.entries(filteredSections).map(([sectionTitle, sectionData]) => (
                    <div key={sectionTitle} className="bg-black/20 rounded-md border border-gray-700">
                        <button onClick={() => toggleSection(sectionTitle)} className="w-full flex items-center justify-between p-2 bg-gray-800/50 rounded-t-md">
                            <span className="font-bold text-sky-400">{sectionTitle}</span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${expandedSections.includes(sectionTitle) ? 'rotate-0' : '-rotate-90'}`} />
                        </button>
                        {expandedSections.includes(sectionTitle) && (
                            <div className="p-2">
                                {Object.entries(sectionData).map(([key, value]) => {
                                    const fieldPath = `${sectionTitle}.${key}`;
                                    const isSelected = selectedFields.includes(fieldPath);

                                    return (
                                        <div key={key} className={`flex items-center gap-3 p-1.5 rounded ${isSelected ? 'bg-sky-500/10' : ''}`}>
                                            <input type="checkbox" checked={isSelected} onChange={() => setSelectedFields(p => p.includes(fieldPath) ? p.filter(i => i !== fieldPath) : [...p, fieldPath])} className="form-checkbox h-4 w-4 bg-gray-600 border-gray-500 rounded text-sky-500 focus:ring-sky-500" />
                                            <div className="w-1/3 truncate text-gray-400" title={key}>{key}</div>
                                            <div className="flex-1 bg-gray-700 rounded px-2 py-1 text-gray-200">
                                                {value === null || value === undefined || value === '' ? (
                                                    <span className="text-gray-500 italic">no data</span>
                                                ) : (
                                                    String(value)
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )) : <div className="text-center text-gray-500 py-10">No data to display or matches found.</div>}
            </div>
        </div>
    );
};

export default JsonTreeView;