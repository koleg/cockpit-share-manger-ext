import React from 'react';
import { SambaShare, SortConfig, SortableKeys } from '../types';

interface ShareListProps {
  shares: SambaShare[];
  onAdd: () => void;
  onEdit: (share: SambaShare) => void;
  onDelete: (share: SambaShare) => void;
  onRefresh: () => void;
  isLoading: boolean;
  sortConfig: SortConfig | null;
  onRequestSort: (key: SortableKeys) => void;
}

const EditIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

const DeleteIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
  </svg>
);

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4a8 8 0 0112.55 3.14M20 20a8 8 0 01-12.55-3.14" />
    </svg>
);

const SortIndicator: React.FC<{
  isSorted: boolean;
  direction: 'ascending' | 'descending';
}> = ({ isSorted, direction }) => {
    const commonClass = "h-4 w-4 transition-opacity";
    const activeClass = "text-gray-800 dark:text-gray-200";
    const inactiveClass = "text-gray-400 dark:text-gray-600";
    
    return (
        <span className="flex flex-col ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClass} ${isSorted && direction === 'ascending' ? activeClass : inactiveClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClass} -mt-2 ${isSorted && direction === 'descending' ? activeClass : inactiveClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </span>
    );
};

const ShareList: React.FC<ShareListProps> = ({ shares, onAdd, onEdit, onDelete, onRefresh, isLoading, sortConfig, onRequestSort }) => {
  const SortableHeader: React.FC<{ sortKey: SortableKeys; children: React.ReactNode; className?: string; textAlignment?: 'left' | 'center' | 'right' }> = 
    ({ sortKey, children, className, textAlignment = 'left' }) => {
    
    const isSorted = sortConfig?.key === sortKey;
    const direction = sortConfig?.direction || 'ascending';

    const alignmentClass = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end'
    }[textAlignment];

    return (
        <th scope="col" className={`py-3 ${className}`}>
            <button
                type="button"
                onClick={() => onRequestSort(sortKey)}
                className={`flex items-center w-full h-full text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider focus:outline-none hover:text-gray-900 dark:hover:text-white transition-colors duration-200 px-6 ${alignmentClass}`}
                aria-label={`Sort by ${children}`}
            >
                {children}
                <SortIndicator isSorted={isSorted} direction={direction} />
            </button>
        </th>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col flex-grow min-h-0">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
        <h2 className="text-gray-900 dark:text-xl font-semibold">Configured Shares</h2>
        <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold p-2 rounded-lg transition duration-300 ease-in-out"
              title="Refresh"
              disabled={isLoading}
            >
              <RefreshIcon className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onAdd}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              <PlusIcon />
              Add Share
            </button>
        </div>
      </div>

      <div className="overflow-auto flex-grow">
        {isLoading ? (
          <div className="text-center p-8 text-gray-700 dark:text-gray-400">Loading shares...</div>
        ) : shares.length === 0 ? (
          <div className="text-center p-8 text-gray-700 dark:text-gray-400">No shares configured. Click "Add Share" to get started.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 table-fixed">
            <thead className="bg-gray-100 dark:bg-gray-700/50 sticky top-0 z-10">
              <tr>
                <SortableHeader sortKey="name" className="w-1/4">Name</SortableHeader>
                <SortableHeader sortKey="path" className="w-1/3">Path</SortableHeader>
                <SortableHeader sortKey="quota" className="w-1/6" textAlignment="center">Quota</SortableHeader>
                <SortableHeader sortKey="used" className="w-1/6" textAlignment="center">Used</SortableHeader>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider sticky right-0 w-[120px] bg-gray-100 dark:bg-gray-700/50">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-700">
              {shares.map(share => (
                <tr key={share.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={share.name}>{share.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-gray-300 truncate" title={share.path}>{share.path}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{share.quota || 'None'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{share.used || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 transition-colors duration-200">
                    <div className="flex items-center justify-end space-x-3">
                      <button onClick={() => onEdit(share)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition duration-150" title="Edit">
                        <EditIcon />
                      </button>
                      <button onClick={() => onDelete(share)} className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400 transition duration-150" title="Delete">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ShareList;