import React, { useState, useEffect } from 'react';
import { Plane, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../locales/translations';

interface HeaderProps {
  onOpenAddModal?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAddModal, theme, onToggleTheme, onHomeClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Dynamic Styling Logic ---
  const headerBgClass = isScrolled 
    ? 'bg-white/90 dark:bg-slate-950/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 py-3' 
    : theme === 'light'
      ? 'bg-white/30 backdrop-blur-sm border-b border-white/20 py-4'
      : 'bg-transparent border-b border-transparent py-5';

  const textColorClass = theme === 'light'
    ? 'text-slate-900' 
    : isScrolled ? 'text-white' : 'text-white';

  const subtitleColorClass = theme === 'light'
    ? 'text-slate-600'
    : 'text-slate-300';

  const logoBoxClass = theme === 'light'
    ? 'bg-blue-600 text-white shadow-blue-500/30'
    : isScrolled
      ? 'bg-blue-600 text-white shadow-blue-500/20'
      : 'bg-white/10 text-white border border-white/10 backdrop-blur-sm';

  const toggleBtnClass = theme === 'light'
    ? 'bg-white/50 hover:bg-white text-slate-700 border border-slate-200/50 shadow-sm'
    : isScrolled
      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10';

  // Language Switcher Configuration
  const langs: { code: Language; label: string }[] = [
    { code: 'zh-TW', label: '繁' },
    { code: 'zh-CN', label: '简' },
    { code: 'en', label: 'EN' }
  ];
  const activeLangIndex = langs.findIndex(l => l.code === language);

  // Dynamic Styles for Lang Switcher based on Theme & Scroll
  const langContainerClass = theme === 'light'
      ? 'bg-white/50 border-slate-200/50'
      : isScrolled 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white/10 border-white/10';

  const langPillClass = theme === 'light'
      ? 'bg-white shadow-sm ring-1 ring-black/5' 
      : isScrolled
        ? 'bg-slate-600 shadow-sm ring-1 ring-white/10'
        : 'bg-white/20 shadow-sm ring-1 ring-white/10';

  const langTextActive = theme === 'light' ? 'text-blue-700' : 'text-white';
  const langTextInactive = theme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${headerBgClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Branding */}
        <button 
          onClick={onHomeClick}
          className="flex items-center gap-3 cursor-pointer select-none group focus:outline-none hover:opacity-80 transition-opacity"
          title={t('appTitle')}
        >
          {/* Logo Icon */}
          <div className={`p-2 rounded-xl shadow-lg transition-all duration-500 group-active:scale-95 ${logoBoxClass}`}>
            <Plane size={20} className="transform -rotate-45" />
          </div>

          {/* Text Container */}
          <div className="flex flex-row items-baseline gap-2 overflow-hidden text-left">
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight transition-colors duration-300 whitespace-nowrap ${textColorClass}`}>
              {t('appTitle')}
            </h1>
            <span className={`text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors duration-300 whitespace-nowrap ${subtitleColorClass}`}>
              {t('appSubtitle')}
            </span>
          </div>
        </button>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          
          {/* Sliding Language Switcher (Grid Layout) */}
          <div className={`relative grid grid-cols-3 p-1 rounded-full border transition-colors duration-300 w-[140px] sm:w-[160px] ${langContainerClass}`}>
             {/* Background Pill */}
             <div 
               className={`absolute inset-y-1 rounded-full transition-transform duration-300 ease-out z-0 ${langPillClass}`}
               style={{
                 left: '4px',
                 width: 'calc((100% - 8px) / 3)',
                 transform: `translateX(${activeLangIndex * 100}%)`
               }}
             />
             
             {langs.map((lang) => (
               <button
                 key={lang.code}
                 onClick={() => setLanguage(lang.code)}
                 className={`
                   relative z-10 w-full py-1 text-[10px] sm:text-xs font-bold rounded-full transition-colors duration-200 text-center
                   ${language === lang.code ? langTextActive : langTextInactive}
                 `}
               >
                 {lang.label}
               </button>
             ))}
          </div>

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