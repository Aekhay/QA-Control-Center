import React, { useState, useRef } from 'react';
import { UploadCloudIcon, AlertTriangleIcon, CheckCircleIcon } from '../constants';
import { TableData } from '../types';

interface TestDataViewProps {
  tableData: TableData | null;
  onDataChange: (data: TableData | null) => void;
}

const TestDataView: React.FC<TestDataViewProps> = ({ tableData, onDataChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{ message: string; type: 'found' | 'not_found' } | null>(null);


  const parseCSV = (csvText: string): TableData => {
    const rows = csvText.trim().split('\n').map(row => row.split(',').map(cell => cell.trim()));
    const headers = rows.shift() || [];
    return { headers, rows };
  };

  const handleFileUpload = (file: File) => {
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const parsedData = parseCSV(text);
        onDataChange(parsedData);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid .csv file.");
    }
  };

  const handleLocalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSearchQuery.trim() || !tableData) {
      setSearchResult(null);
      return;
    }
    const query = localSearchQuery.trim();
    const found = tableData.rows.some(row => row.some(cell => cell.trim() === query));

    setSearchResult({
      message: found
        ? `SKU ${query} is in Automation Testdata list.`
        : `SKU ${query} is available for Testing Purpose.`,
      type: found ? 'found' : 'not_found'
    });
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  if (!tableData) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Upload Test Data</h2>
        <div 
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          className={`border-2 border-dashed rounded-lg p-12 transition-colors ${isDragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 bg-slate-100'}`}
        >
          <UploadCloudIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 mb-2">Drag & drop your CSV file here or</p>
          <input
            type="file"
            id="csv-upload"
            className="hidden"
            accept=".csv"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
          />
          <label htmlFor="csv-upload" className="font-medium text-sky-600 hover:text-sky-700 cursor-pointer">
            browse to upload
          </label>
        </div>
      </div>
    );
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        id="csv-replace-upload"
        className="hidden"
        accept=".csv"
        onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
            }
            if(e.target) e.target.value = '';
        }}
        />
        
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Test Data</h2>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
                >
                  <UploadCloudIcon className="w-4 h-4 text-sky-600" />
                  Replace File
                </button>
            </div>
            
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Quick SKU Check</h3>
                <form onSubmit={handleLocalSearch} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={localSearchQuery}
                        onChange={(e) => {
                            setLocalSearchQuery(e.target.value);
                            if (searchResult) setSearchResult(null);
                        }}
                        placeholder="Enter SKU to validate..."
                        className="flex-grow px-3 py-2 bg-slate-50 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-md font-medium bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                    >
                        Search
                    </button>
                </form>
                {searchResult && (
                    <div className={`mt-4 p-3 rounded-md flex items-center gap-3 text-sm border-l-4 ${searchResult.type === 'found' ? 'bg-amber-50 border-amber-500' : 'bg-green-50 border-green-500'}`}>
                        <div className={searchResult.type === 'found' ? 'text-amber-600' : 'text-green-600'}>
                            {searchResult.type === 'found' ? <AlertTriangleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                        </div>
                        <span className="font-medium text-slate-700">{searchResult.message}</span>
                    </div>
                )}
            </div>
            
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Data Preview</h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200 max-h-[60vh]">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0">
                        <tr>
                            {tableData.headers.map((header, index) => (
                                <th key={index} scope="col" className="px-6 py-3">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default TestDataView;