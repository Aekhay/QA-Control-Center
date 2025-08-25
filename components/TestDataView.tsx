import React, { useState } from 'react';
import { UploadCloudIcon, AlertTriangleIcon, CheckCircleIcon, TrashIcon } from '../constants';
import { TableData, TestDataSet } from '../types';

interface TestDataViewProps {
  dataSets: TestDataSet[];
  onAdd: (dataSet: Omit<TestDataSet, 'id'>) => void;
  onDelete: (id: string) => void;
  activeDataSetId: string | null;
  onSetActive: (id: string) => void;
}

const DataSetPreview: React.FC<{ dataSet: TestDataSet }> = ({ dataSet }) => {
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<{ message: string; type: 'found' | 'not_found' } | null>(null);

    const handleLocalSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!localSearchQuery.trim() || !dataSet.tableData) {
            setSearchResult(null);
            return;
        }
        const query = localSearchQuery.trim();
        const found = dataSet.tableData.rows.some(row => row.some(cell => cell.trim() === query));
        
        setSearchResult({
            message: found
                ? `SKU ${query} exists in this dataset.`
                : `SKU ${query} is not in this dataset.`,
            type: found ? 'found' : 'not_found'
        });
    };

    return (
        <div className="mt-4 space-y-4">
             <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-md font-semibold text-gray-200 mb-2">Quick SKU Check</h3>
                <form onSubmit={handleLocalSearch} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={localSearchQuery}
                        onChange={(e) => {
                            setLocalSearchQuery(e.target.value);
                            if (searchResult) setSearchResult(null);
                        }}
                        placeholder="Enter SKU to validate..."
                        className="flex-grow px-3 py-2 bg-gray-900 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-md font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                    >
                        Search
                    </button>
                </form>
                {searchResult && (
                    <div className={`mt-3 p-3 rounded-md flex items-center gap-3 text-sm border-l-4 ${searchResult.type === 'found' ? 'bg-red-900/40 border-red-500' : 'bg-green-900/40 border-green-500'}`}>
                        <div className={searchResult.type === 'found' ? 'text-red-400' : 'text-green-400'}>
                            {searchResult.type === 'found' ? <AlertTriangleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                        </div>
                        <span className="font-medium text-gray-300">{searchResult.message}</span>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700 max-h-[40vh]">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                        <tr>
                            {dataSet.tableData.headers.map((header, index) => (
                                <th key={index} scope="col" className="px-6 py-3">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataSet.tableData.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const TestDataView: React.FC<TestDataViewProps> = ({ dataSets, onAdd, onDelete, activeDataSetId, onSetActive }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [viewingDataSetId, setViewingDataSetId] = useState<string | null>(null);
  
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
        const newDataSet: Omit<TestDataSet, 'id'> = {
            name: file.name,
            tableData: parseCSV(text),
            createdAt: new Date().toISOString(),
        };
        onAdd(newDataSet);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid .csv file.");
    }
  };
  
  const handleDelete = (idToDelete: string) => {
    if(window.confirm("Are you sure you want to delete this data set?")) {
        onDelete(idToDelete);
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  if (dataSets.length === 0) {
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-200 tracking-tight mb-4">Upload Test Data</h2>
            <div 
                onDrop={onDrop} onDragOver={onDragOver} onDragEnter={onDragEnter} onDragLeave={onDragLeave}
                className={`border-2 border-dashed rounded-lg p-12 transition-colors ${isDragging ? 'border-sky-500 bg-sky-900/30' : 'border-gray-600 bg-gray-800'}`}
            >
                <UploadCloudIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 mb-2">Drag & drop your CSV file here or</p>
                <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}/>
                <label htmlFor="csv-upload" className="font-medium text-sky-400 hover:text-sky-300 cursor-pointer">browse to upload</label>
            </div>
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-200 tracking-tight">Test Data Sets</h2>
        <label htmlFor="csv-upload-new" className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors cursor-pointer">
            <UploadCloudIcon className="w-4 h-4" />
            Upload New File
        </label>
        <input type="file" id="csv-upload-new" className="hidden" accept=".csv" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}/>
      </div>
      
      <div className="space-y-3">
        {dataSets.map(ds => (
          <div key={ds.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <input
                        type="radio"
                        id={`radio-${ds.id}`}
                        name="activeDataSet"
                        checked={activeDataSetId === ds.id}
                        onChange={() => onSetActive(ds.id)}
                        className="h-4 w-4 text-sky-600 bg-gray-700 border-gray-600 focus:ring-sky-500"
                    />
                    <div>
                        <label htmlFor={`radio-${ds.id}`} className="font-medium text-gray-200 cursor-pointer">{ds.name}</label>
                        <p className="text-xs text-gray-500">{ds.tableData.rows.length} rows &bull; Uploaded {new Date(ds.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewingDataSetId(viewingDataSetId === ds.id ? null : ds.id)}
                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600"
                    >
                        {viewingDataSetId === ds.id ? 'Hide' : 'Preview'}
                    </button>
                    <button onClick={() => handleDelete(ds.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-full">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {viewingDataSetId === ds.id && <DataSetPreview dataSet={ds} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestDataView;