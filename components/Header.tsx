import React, { useState, useEffect } from 'react';
import { Plane, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAddModal, theme, onToggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b ${
        isScrolled 
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-2 border-slate-200 dark:border-slate-800 shadow-sm' 
          : 'bg-transparent py-4 border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 group cursor-default">
          <div className={`p-2 rounded-xl transition-all duration-300 shadow-lg ${
            isScrolled 
              ? 'bg-blue-600 shadow-blue-500/20 text-white' 
              : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
          }`}>
            <Plane size={24} className="transform -rotate-45 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
              isScrolled 
                ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-400 dark:to-cyan-400' 
                : 'text-white'
            }`}>
              SkyMetrics
            </span>
            {/* Optional subtitle that fades out on scroll */}
            <span className={`text-[10px] font-medium tracking-widest uppercase transition-opacity duration-300 ${
              isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'text-blue-200/80'
            }`}>
              Aviation Data
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onToggleTheme}
            className={`p-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isScrolled
                ? 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                : 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10'
            }`}
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;