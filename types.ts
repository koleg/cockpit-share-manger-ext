export interface SambaShare {
  id: string;
  name: string;
  path: string;
  comment: string;
  guestOk: boolean;
  readOnly: boolean;
  browsable: boolean;
  quota: string;
  used?: string; // Added field for real-time space usage
  advancedSettings?: string;
}

export interface AppSettings {
  shareConfigBasePath: string;
  defaultParentPath: string;
  defaultMountpointName: string;
  theme: 'dark' | 'light'; // Added theme setting
}

export interface FilesystemUsage {
  filesystem: string;
  mountpoint: string;
  size: string;
  available: string;
  used: string;
  usedPercent: string;
}

// Types for table sorting
export type SortableKeys = 'name' | 'path' | 'quota' | 'used';
export type SortDirection = 'ascending' | 'descending';

export interface SortConfig {
  key: SortableKeys;
  direction: SortDirection;
}