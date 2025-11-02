import React, { useState, useEffect } from 'react';
import { SambaShare } from '../types';
import Modal from './Modal';

interface ShareFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (share: Omit<SambaShare, 'id'> | SambaShare) => void;
  share: SambaShare | null;
  defaultParentPath: string;
  defaultMountpointName: string;
  error: string | null; // New prop for submission error
}

const EyeOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

const EyeClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781z" clipRule="evenodd" />
    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A10.025 10.025 0 00.458 10c1.274 4.057 5.022 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
  </svg>
);


const ShareForm: React.FC<ShareFormProps> = ({ isOpen, onClose, onSave, share, defaultParentPath, defaultMountpointName, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    comment: '',
    guestOk: false,
    readOnly: false,
    browsable: true,
    quota: '', 
    advancedSettings: '',
  });
  
  // State for whether advanced settings are *enabled* (controlled by checkbox)
  const [isAdvancedEnabled, setIsAdvancedEnabled] = useState(false);
  // State for whether the textarea is *visible* (controlled by checkbox AND eye icon)
  const [isAdvancedVisible, setIsAdvancedVisible] = useState(false);
  
  const [quotaError, setQuotaError] = useState<string | null>(null);

  useEffect(() => {
    if (share) {
      const hasAdvancedSettings = !!share.advancedSettings;
      setFormData({
        name: share.name,
        path: share.path,
        comment: share.comment,
        guestOk: share.guestOk,
        readOnly: share.readOnly,
        browsable: share.browsable,
        quota: share.quota || '', 
        advancedSettings: share.advancedSettings || '',
      });
      setIsAdvancedEnabled(hasAdvancedSettings);
      setIsAdvancedVisible(hasAdvancedSettings);
    } else {
      const initialPathParts: string[] = [];
      if (defaultParentPath) {
        initialPathParts.push(defaultParentPath.replace(/\/+$/, ''));
      }
      if (defaultMountpointName) {
        initialPathParts.push(defaultMountpointName.replace(/^\/+/, '').replace(/\/+$/, ''));
      }
      const constructedPath = initialPathParts.join('/');

      setFormData({
        name: '',
        path: constructedPath || '/',
        comment: '',
        guestOk: false,
        readOnly: false,
        browsable: true,
        quota: '',
        advancedSettings: '',
      });
      setIsAdvancedEnabled(false);
      setIsAdvancedVisible(false);
    }
    setQuotaError(null);
  }, [share, isOpen, defaultParentPath, defaultMountpointName]);

  const validateQuota = (value: string): boolean => {
    if (!value) {
        setQuotaError(null);
        return true; 
    }
    const regex = /^(\d+)\s*(K|M|G|T|P)?B?$/i; 
    const match = value.match(regex);

    if (!match) {
      setQuotaError('Invalid format. Use positive integer + unit (e.g., 100KB, 500MB, 1G, 2TB).');
      return false;
    }
    
    const num = parseInt(match[1], 10);
    if (isNaN(num) || num <= 0) {
        setQuotaError('Quota must be a positive integer.');
        return false;
    }
    
    setQuotaError(null);
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        if (name === 'quota') {
            const formattedValue = value.toUpperCase();
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
            validateQuota(formattedValue);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }
  };
  
  const handleToggleAdvancedEnabled = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsAdvancedEnabled(isChecked);
    // Sync visibility with the checkbox state
    setIsAdvancedVisible(isChecked);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quota && !validateQuota(formData.quota)) {
        return;
    }
    const finalData = { ...formData };
    // The save logic is controlled ONLY by the checkbox state
    if (!isAdvancedEnabled) {
      finalData.advancedSettings = '';
    }
    if (share) {
      onSave({ ...share, ...finalData });
    } else {
      onSave(finalData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 bg-white dark:bg-gray-800">
          <h3 className="text-gray-900 dark:text-xl font-semibold mb-4">
            {share ? 'Edit Share' : 'Add New Share'}
          </h3>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative mb-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}
          <div className="space-y-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Share Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-gray-50 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
            </div>
            <div>
              <label htmlFor="path" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Path</label>
              <input type="text" name="path" id="path" value={formData.path} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-gray-50 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comment</label>
              <input type="text" name="comment" id="comment" value={formData.comment} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
            </div>
            <div>
              <label htmlFor="quota" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Quota</label>
              <input 
                type="text" 
                name="quota" 
                id="quota" 
                value={formData.quota} 
                onChange={handleChange} 
                className={`mt-1 block w-full px-3 py-2 bg-gray-50 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${quotaError ? 'border-red-500' : ''}`}
                placeholder="e.g., 10GB, 500M, 1TB"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Specify an integer followed by an optional unit (K, M, G, T, P). Units are case-insensitive but will be saved as uppercase (e.g., "gb" becomes "GB").</p>
              {quotaError && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{quotaError}</p>}
            </div>
             <div className="flex items-start space-x-8">
                <div className="flex items-center h-5">
                    <input id="readOnly" name="readOnly" type="checkbox" checked={formData.readOnly} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded bg-gray-50 dark:border-gray-600 dark:bg-gray-700"/>
                </div>
                <div className="text-sm">
                    <label htmlFor="readOnly" className="font-medium text-gray-700 dark:text-gray-300">Read Only</label>
                    <p className="text-gray-500 dark:text-gray-400">Prevent users from creating or modifying files.</p>
                </div>
            </div>
             <div className="flex items-start space-x-8">
                <div className="flex items-center h-5">
                    <input id="browsable" name="browsable" type="checkbox" checked={formData.browsable} onChange={handleChange} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded bg-gray-50 dark:border-gray-600 dark:bg-gray-700"/>
                </div>
                <div className="text-sm">
                    <label htmlFor="browsable" className="font-medium text-gray-700 dark:text-gray-300">Browsable</label>
                    <p className="text-gray-500 dark:text-gray-400">Make this share visible in the network list.</p>
                </div>
            </div>
            <div className="border-t border-gray-300 dark:border-gray-700 pt-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-start space-x-8">
                        <div className="flex items-center h-5">
                            <input id="showAdvanced" name="showAdvanced" type="checkbox" checked={isAdvancedEnabled} onChange={handleToggleAdvancedEnabled} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded bg-gray-50 dark:border-gray-600 dark:bg-gray-700"/>
                        </div>
                        <div className="text-sm">
                            <label htmlFor="showAdvanced" className="font-medium text-gray-700 dark:text-gray-300">Advanced settings</label>
                            <p className="text-gray-500 dark:text-gray-400">Add raw smb.conf options.</p>
                        </div>
                    </div>
                    {isAdvancedEnabled && (
                      <button
                          type="button"
                          onClick={() => setIsAdvancedVisible(!isAdvancedVisible)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                          aria-label="Toggle advanced settings visibility"
                      >
                          {isAdvancedVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
                      </button>
                    )}
                </div>

                {isAdvancedVisible && (
                    <div className="mt-2">
                        <textarea 
                            name="advancedSettings" 
                            id="advancedSettings" 
                            value={formData.advancedSettings} 
                            onChange={handleChange}
                            rows={5}
                            className="mt-1 block w-full px-3 py-2 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-mono text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                            placeholder="e.g.&#10;valid users = user1 @group&#10;write list = user1"
                        />
                    </div>
                )}
            </div>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-400 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-100 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800">
            Cancel
          </button>
          <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800">
            Save Share
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ShareForm;