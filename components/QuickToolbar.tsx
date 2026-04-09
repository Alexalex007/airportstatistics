import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronUp, 
  BarChart2, 
  Plus, 
  ExternalLink, 
  MousePointer2,
  LayoutGrid,
  Globe
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AirportDefinition } from '../types';

interface QuickToolbarProps {
  airports: AirportDefinition[];
  onOpenAddModal: () => void;
  onOpenComparison: () => void;
  isDarkMode: boolean;
}

const OFFICIAL_LINKS: Record<string, string> = {
  'HKG': 'https://www.hongkongairport.com',
  'TPE': 'https://www.taoyuan-airport.com',
  'SIN': 'https://www.changiairport.com',
  'BKK': 'https://www.airportthai.co.th',
  'ICN': 'https://www.airport.kr',
  'MNL': 'https://www.miaa.gov.ph',
  'NRT': 'https://www.naa.jp'
};

const QuickToolbar: React.FC<QuickToolbarProps> = ({ 
  airports, 
  onOpenAddModal, 
  onOpenComparison,
  isDarkMode 
}) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const sourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
        setShowSources(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (sourcesRef.current && !sourcesRef.current.contains(event.target as Node)) {
        setShowSources(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToAirport = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset for header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsExpanded(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2"
        >
          {/* Sources Dropdown */}
          <AnimatePresence>
            {showSources && (
              <motion.div
                ref={sourcesRef}
                initial={{ y: 10, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 10, opacity: 0, scale: 0.95 }}
                className={`
                  mb-2 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl w-48
                  ${isDarkMode 
                    ? 'bg-slate-900/90 border-slate-700 text-slate-100' 
                    : 'bg-white/90 border-white text-slate-800'}
                `}
              >
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                  {t('officialSite')}
                </div>
                <div className="max-h-48 overflow-y-auto no-scrollbar">
                  {Object.entries(OFFICIAL_LINKS).map(([code, url]) => (
                    <a
                      key={code}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold"
                    >
                      <span>{code}</span>
                      <ExternalLink size={12} className="opacity-40" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Toolbar Container */}
          <div className={`
            flex items-center gap-1 p-1.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300
            ${isDarkMode 
              ? 'bg-slate-900/80 border-slate-700/50 text-slate-100' 
              : 'bg-white/80 border-white/50 text-slate-800'}
          `}>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-1 mr-1">
              <button
                onClick={scrollToTop}
                title={t('scrollToTop')}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <ChevronUp size={20} className="group-hover:-translate-y-0.5 transition-transform" />
              </button>
              
              <button
                onClick={() => setShowSources(!showSources)}
                title={t('officialSite')}
                className={`
                  p-2.5 rounded-xl transition-colors
                  ${showSources 
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                `}
              >
                <Globe size={20} />
              </button>

              <button
                onClick={onOpenComparison}
                title={t('comparisonLab')}
                className="p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
              >
                <BarChart2 size={20} />
              </button>

              <button
                onClick={onOpenAddModal}
                title={t('addData')}
                className="p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Airport Jump Links */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all
                  ${isExpanded 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                `}
              >
                <LayoutGrid size={18} />
                <span className="hidden sm:inline">{t('quickLinks')}</span>
              </button>

              {/* Expanded Airport List (Horizontal) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center gap-1 overflow-hidden"
                  >
                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
                    {airports.map((ap) => (
                      <button
                        key={ap.code}
                        onClick={() => scrollToAirport(ap.code)}
                        className="px-3 py-2 rounded-xl text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
                      >
                        {ap.code}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tooltip Indicator */}
          {!isExpanded && !showSources && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <MousePointer2 size={10} />
                <span>Quick Access</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickToolbar;

