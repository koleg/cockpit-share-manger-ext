
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SambaShare, AppSettings, SortConfig, SortableKeys, FilesystemUsage } from './types';
import { sambaService } from './services/sambaService';
import ShareList from './components/ShareList';
import Header from './components/Header';
import ShareForm from './components/ShareForm';
import ConfirmationDialog from './components/ConfirmationDialog';
import SettingsModal from './components/SettingsModal';


// Helper function to parse size strings (e.g., "10GB", "500M") into a comparable number (in KB)
const parseSizeToKB = (sizeString: string | undefined): number => {
  // Return a very large number for invalid/empty values to sort them last.
  if (!sizeString || typeof sizeString !== 'string') {
    return Number.MAX_SAFE_INTEGER;
  }

  const s = sizeString.trim().toUpperCase();

  // Treat 'None', 'N/A' or empty strings as "no value"
  if (s === 'NONE' || s === 'N/A' || s === '') {
    return Number.MAX_SAFE_INTEGER;
  }

  const match = s.match(/^(\d+(\.\d+)?)\s*(K|M|G|T|P)?B?$/);

  // If the format is invalid, sort it last.
  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const value = parseFloat(match[1]);

  // Handle all zero values (0, 0K, 0M) as the smallest sortable value.
  if (value === 0) {
    return 0;
  }

  const unit = match[3];

  switch (unit) {
    case 'P': return value * 1024 * 1024 * 1024 * 1024;
    case 'T': return value * 1024 * 1024 * 1024;
    case 'G': return value * 1024 * 1024;
    case 'M': return value * 1024;
    case 'K': return value;
    default: // Assumes kilobytes if no unit is given (common for quota tools)
      return value;
  }
};

// This function converts a string of kilobytes into a human-readable format.
const formatKilobytes = (kbString: string): string => {
  if (!kbString || typeof kbString !== 'string') {
    return 'N/A';
  }
  const kb = parseInt(kbString, 10);
  if (isNaN(kb)) {
    return kbString; // Return original string if it's not a number
  }

  if (kb < 0) return 'N/A';
  if (kb === 0) return '0 KB';

  const sizes = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(kb) / Math.log(1024));

  const val = kb / Math.pow(1024, i);
  
  // Display with one decimal place unless it's just KB
  return `${i === 0 ? val : val.toFixed(1)} ${sizes[i]}`;
};


const App: React.FC = () => {
  const [shares, setShares] = useState<SambaShare[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSambaConfigured, setIsSambaConfigured] = useState<boolean>(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    shareConfigBasePath: '/etc/cockpit/zfs/shares',
    defaultParentPath: '/srv',
    defaultMountpointName: 'smbdatastore',
    theme: 'dark', // Default theme
  });
  const [fsUsage, setFsUsage] = useState<FilesystemUsage | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  
  const [formError, setFormError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  
  const [currentShare, setCurrentShare] = useState<SambaShare | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'name', direction: 'ascending' });


  const fetchShares = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedShares = await sambaService.getShares();
      setShares(fetchedShares);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shares.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const settings = await sambaService.getSettings();
      setAppSettings(settings);
      const usage = await sambaService.getFilesystemUsage(settings);
      setFsUsage(usage);
    } catch (err: any) {
      console.error('Failed to load app settings or usage, using defaults.', err);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    // fetchShares handles its own loading state which is used by the refresh button spinner
    const sharesPromise = fetchShares();

    // In parallel, fetch the filesystem usage and update its state
    const fsUsagePromise = sambaService.getFilesystemUsage(appSettings)
      .then(usage => {
        setFsUsage(usage);
      })
      .catch(err => {
        // Log error but don't disrupt the main UI error state
        console.error('Failed to refresh filesystem usage:', err);
      });
    
    // Wait for both to complete
    await Promise.all([sharesPromise, fsUsagePromise]);
  }, [fetchShares, appSettings]);

  const checkConfig = useCallback(async () => {
    try {
        const isConfigured = await sambaService.checkSambaConfig();
        setIsSambaConfigured(isConfigured);
        if (isConfigured) {
            fetchShares();
        } else {
            setIsLoading(false);
        }
    } catch (err) {
        setError('Could not verify Samba configuration.');
        setIsLoading(false);
    }
  }, [fetchShares]);


  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (appSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appSettings.theme]);

  // Effect to prevent background scrolling when a modal is open
  useEffect(() => {
    const isModalOpen = isFormModalOpen || isConfirmModalOpen || isSettingsModalOpen;
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    // Cleanup function to ensure scroll is restored if component unmounts
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isFormModalOpen, isConfirmModalOpen, isSettingsModalOpen]);

  useEffect(() => {
    if (appSettings.shareConfigBasePath) {
        checkConfig();
    }
  }, [appSettings.shareConfigBasePath, checkConfig]);

  const sortedShares = useMemo(() => {
    let sortableItems = [...shares];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof SambaShare];
        const bVal = b[sortConfig.key as keyof SambaShare];
        
        let comparison = 0;
        if (sortConfig.key === 'quota' || sortConfig.key === 'used') {
            const aSize = parseSizeToKB(aVal as string);
            const bSize = parseSizeToKB(bVal as string);
            if (aSize < bSize) {
              comparison = -1;
            } else if (aSize > bSize) {
              comparison = 1;
            }
        } else { // String comparison for name and path
            const strA = String(aVal || '');
            const strB = String(bVal || '');
            comparison = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
        }
        
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [shares, sortConfig]);

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const handleEnableConfig = async () => {
    try {
        setError(null);
        await sambaService.createConfigDirectories();
        await sambaService.enableSambaConfig();
        await sambaService._commitAndReload();
        setIsSambaConfigured(true);
        await fetchShares();
    } catch(err: any) {
        setError(err.message || 'Failed to enable Samba configuration.');
    }
  };


  const handleAdd = () => {
    setCurrentShare(null);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (share: SambaShare) => {
    setCurrentShare(share);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleDelete = (share: SambaShare) => {
    setCurrentShare(share);
    setIsConfirmModalOpen(true);
  };

  const handleSave = async (shareData: Omit<SambaShare, 'id'> | SambaShare) => {
    try {
        setError(null);
        setFormError(null);
        let newShares: SambaShare[];
        if ('id' in shareData && shareData.id) {
            newShares = await sambaService.updateShare(shareData as SambaShare);
        } else {
            newShares = await sambaService.addShare(shareData as Omit<SambaShare, 'id'>);
        }
        setShares(newShares);
        setIsFormModalOpen(false);
        setCurrentShare(null);
    } catch (err: any) {
        setFormError(err.message || 'Failed to save share.');
    }
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    try {
        setError(null);
        setSettingsError(null);
        const pathChanged = newSettings.shareConfigBasePath !== appSettings.shareConfigBasePath;

        // Save the new settings to the config file first.
        await sambaService.saveSettings(newSettings);

        // If the base path changed, it's critical to ensure the new directories exist.
        // The service function reads the newly saved settings from the file.
        if (pathChanged) {
            await sambaService.createConfigDirectories();
        }

        // Now, update the application's internal state.
        setAppSettings(newSettings);
        
        // Fetch filesystem usage with the potentially new default paths.
        const usage = await sambaService.getFilesystemUsage(newSettings);
        setFsUsage(usage);

        // If the path changed, we need to rebuild the main include files and refetch shares from the new location.
        if (pathChanged) {
             await sambaService._commitAndReload();
             await fetchShares();
        }
       
        setIsSettingsModalOpen(false);
    } catch (err: any) {
        setSettingsError(err.message || 'Failed to save settings.');
    }
  };

  const confirmDelete = async () => {
    if (currentShare) {
      try {
        setError(null);
        const newShares = await sambaService.deleteShare(currentShare.id);
        setShares(newShares);
      } catch (err: any) {
        setError(err.message || 'Failed to delete share.');
      } finally {
        setIsConfirmModalOpen(false);
        setCurrentShare(null);
      }
    }
  };

  const handleOpenSettings = () => {
    setSettingsError(null);
    setIsSettingsModalOpen(true);
  };

  return (
    <div className="h-screen bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-sans flex flex-col">
      <Header onOpenSettings={handleOpenSettings} />
      <main className="container mx-auto p-4 md:p-8 flex-grow flex flex-col min-h-0">
        {fsUsage && (
          <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 mb-6 text-sm text-gray-700 dark:text-gray-300 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono shadow-md">
            <span className="font-bold truncate" title={fsUsage.mountpoint}>{fsUsage.mountpoint}</span>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <span><span className="font-semibold">Size:</span> {formatKilobytes(fsUsage.size)}</span>
              <span><span className="font-semibold">Avail:</span> {formatKilobytes(fsUsage.available)}</span>
              <span><span className="font-semibold">Used:</span> {formatKilobytes(fsUsage.used)} ({fsUsage.usedPercent})</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-800 dark:border-red-600 dark:text-red-100 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {!isSambaConfigured && !isLoading && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-100 px-4 py-3 rounded-lg relative mb-6 text-center">
                <strong className="font-bold block text-lg mb-2">Configuration Required</strong>
                <p className="mb-4">Your main Samba configuration is not set up to load shares from this manager.</p>
                <button 
                    onClick={handleEnableConfig}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                >
                    Enable Now
                </button>
            </div>
        )}

        {isSambaConfigured && (
            <ShareList
                shares={sortedShares}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                sortConfig={sortConfig}
                onRequestSort={requestSort}
            />
        )}
      </main>
      
      {isFormModalOpen && (
        <ShareForm
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setFormError(null);
          }}
          onSave={handleSave}
          share={currentShare}
          defaultParentPath={appSettings.defaultParentPath}
          defaultMountpointName={appSettings.defaultMountpointName}
          error={formError}
        />
      )}

      {isConfirmModalOpen && currentShare && (
        <ConfirmationDialog
          isOpen={isConfirmModalOpen}
          title="Delete Share"
          message={`Are you sure you want to delete the share "[${currentShare.name}]"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => {
            setIsSettingsModalOpen(false);
            setSettingsError(null);
          }}
          onSave={handleSaveSettings}
          currentSettings={appSettings}
          saveError={settingsError}
        />
      )}
    </div>
  );
};

export default App;
