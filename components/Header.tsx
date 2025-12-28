import React, { useState, useEffect } from 'react';
import { Plane, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAddModal, theme, onToggleTheme, onHomeClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Dynamic Styling Logic ---

  // 1. Background
  // Scrolled: Stronger glass effect
  // Top (Light): Subtle glass to separate from Hero content slightly.
  // We use a very subtle white tint in Light mode at the top to ensure text legibility and a premium feel.
  const headerBgClass = isScrolled 
    ? 'bg-white/90 dark:bg-slate-950/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 py-3' 
    : theme === 'light'
      ? 'bg-white/30 backdrop-blur-sm border-b border-white/20 py-4' // Light Mode Top: Subtle Glass
      : 'bg-transparent border-b border-transparent py-5'; // Dark Mode Top: Transparent

  // 2. Text Color
  // Light Mode (Top & Scrolled): Dark Slate for contrast
  // Dark Mode (Top & Scrolled): White
  const textColorClass = theme === 'light'
    ? 'text-slate-900' 
    : isScrolled ? 'text-white' : 'text-white';

  // 3. Subtitle Color
  const subtitleColorClass = theme === 'light'
    ? 'text-slate-600'
    : 'text-slate-300';

  // 4. Logo Box Style
  // Light Mode: Always Blue Background for strong branding
  // Dark Mode: Glassy when top, Blue when scrolled
  const logoBoxClass = theme === 'light'
    ? 'bg-blue-600 text-white shadow-blue-500/30'
    : isScrolled
      ? 'bg-blue-600 text-white shadow-blue-500/20'
      : 'bg-white/10 text-white border border-white/10 backdrop-blur-sm';

  // 5. Toggle Button
  const toggleBtnClass = theme === 'light'
    ? 'bg-white/50 hover:bg-white text-slate-700 border border-slate-200/50 shadow-sm'
    : isScrolled
      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${headerBgClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Branding (Clickable Home Button) */}
        <button 
          onClick={onHomeClick}
          className="flex items-center gap-3 cursor-pointer select-none group focus:outline-none hover:opacity-80 transition-opacity"
          title="返回首頁"
        >
          
          {/* Logo Icon */}
          <div className={`p-2 rounded-xl shadow-lg transition-all duration-500 group-active:scale-95 ${logoBoxClass}`}>
            <Plane size={20} className="transform -rotate-45" />
          </div>

          {/* Text Container */}
          <div className="flex flex-row items-baseline gap-2 overflow-hidden text-left">
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight transition-colors duration-300 whitespace-nowrap ${textColorClass}`}>
              SkyMetrics
            </h1>
            <span className={`text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors duration-300 whitespace-nowrap ${subtitleColorClass}`}>
              Aviation Data
            </span>
          </div>
        </button>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleTheme}
            className={`
              relative p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95
              ${toggleBtnClass}
            `}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;