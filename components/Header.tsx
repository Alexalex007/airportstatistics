import React from 'react';
import { Plane, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAddModal, theme, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/30">
            <Plane size={24} className="transform -rotate-45 w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
            SkyMetrics
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;