import React from 'react';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="bg-gray-200 dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-gray-800 dark:text-white text-2xl font-bold tracking-wider">
            Samba Share Manager for EXT filesystem
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your Samba shares with ease</p>
        </div>
        <button
          onClick={onOpenSettings}
          className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
          aria-label="Open settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.3-.837-2.918.668-2.147 1.953.337.527.106 1.286-.51 1.611-1.56.38-1.56 2.6 0 2.98.616.325.847 1.084.51 1.611-.771 1.285.847 2.79 2.148 1.953.6-.38.831-.112.948.51.38 1.56 2.6 1.56 2.98 0 .117-.622.348-.89.948-.51 1.3.837 2.918-.668 2.147-1.953-.337-.527-.106-1.286.51-1.611 1.56-.38 1.56-2.6 0 2.98-.616-.325-.847-1.084-.51-1.611.771-1.285-.847-2.79-2.148-1.953-.6.38-.831.112-.948-.51zM10 11a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          Settings
        </button>
      </div>
    </header>
  );
};

export default Header;