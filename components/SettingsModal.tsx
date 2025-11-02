import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  currentSettings: AppSettings;
  saveError: string | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings, saveError }) => {
  const [formData, setFormData] = useState<AppSettings>(currentSettings);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  useEffect(() => {
    setFormData(currentSettings);
    setErrors({});
  }, [currentSettings, isOpen]);

  const validatePath = (value: string): string | null => {
    if (!value.startsWith('/')) {
      return 'Path must start with "/".';
    }
    if (value.length > 1 && value.endsWith('/')) { 
        return 'Path should not end with "/".';
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'shareConfigBasePath' || name === 'defaultParentPath') {
        setErrors(prev => ({ ...prev, [name]: validatePath(value) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string | null } = {};
    newErrors.shareConfigBasePath = validatePath(formData.shareConfigBasePath);
    newErrors.defaultParentPath = validatePath(formData.defaultParentPath);

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(error => error !== null);
    if (hasErrors) {
      return;
    }

    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 bg-white dark:bg-gray-800">
          <h3 className="text-gray-900 dark:text-xl font-semibold mb-4">Application Settings</h3>
          {saveError && (
             <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative mb-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{saveError}</span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="shareConfigBasePath" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Share Configuration Base Path</label>
              <input 
                type="text" 
                name="shareConfigBasePath" 
                id="shareConfigBasePath" 
                value={formData.shareConfigBasePath} 
                onChange={handleChange} 
                required 
                className={`mt-1 block w-full bg-gray-50 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.shareConfigBasePath ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.shareConfigBasePath}
                aria-describedby="shareConfigBasePath-error"
              />
              {errors.shareConfigBasePath && <p id="shareConfigBasePath-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.shareConfigBasePath}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Directory where individual share config files (.conf) are stored.</p>
            </div>
            <div>
              <label htmlFor="defaultParentPath" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Parent Path for Shares</label>
              <input 
                type="text" 
                name="defaultParentPath" 
                id="defaultParentPath" 
                value={formData.defaultParentPath} 
                onChange={handleChange} 
                required 
                className={`mt-1 block w-full bg-gray-50 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.defaultParentPath ? 'border-red-500' : ''}`}
                aria-invalid={!!errors.defaultParentPath}
                aria-describedby="defaultParentPath-error"
              />
              {errors.defaultParentPath && <p id="defaultParentPath-error" className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.defaultParentPath}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The default base directory suggested for new share paths (e.g., /srv).</p>
            </div>
            <div>
              <label htmlFor="defaultMountpointName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Mountpoint Name (for new share paths)</label>
              <input 
                type="text" 
                name="defaultMountpointName" 
                id="defaultMountpointName" 
                value={formData.defaultMountpointName} 
                onChange={handleChange} 
                required 
                className="mt-1 block w-full bg-gray-50 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">A suggested name that can be used to construct default paths (e.g., if default parent is /srv and this is smbdatastore, a new share 'my_share' might default to /srv/smbdatastore/my_share).</p>
            </div>
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
              <select 
                name="theme" 
                id="theme" 
                value={formData.theme} 
                onChange={handleChange} 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose between a dark or light color scheme for the application interface.</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-400 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-100 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800">
            Cancel
          </button>
          <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800">
            Save Settings
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SettingsModal;