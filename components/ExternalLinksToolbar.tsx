import React, { useState } from 'react';
import { ExternalLink, PlaneTakeoff, Newspaper, LineChart, PieChart, Link2, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

const ExternalLinksToolbar: React.FC = () => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const links = [
    {
      id: 'flightaware',
      title: t('linkFlightAware'),
      url: 'https://www.flightaware.com/live/airport/VHHH',
      icon: <PlaneTakeoff size={18} />,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'cathay',
      title: t('linkCathay'),
      url: 'https://news.cathaypacific.com/zh-hk',
      icon: <Newspaper size={18} />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'sia',
      title: t('linkSIA'),
      url: 'https://www.singaporeair.com/en_UK/sg/about-us/information-for-investors/operating-statistics/',
      icon: <LineChart size={18} />,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      border: 'border-orange-200 dark:border-orange-800'
    },
    {
      id: 'cad',
      title: t('linkCAD'),
      url: 'https://www.cad.gov.hk/chinese/statistics.html',
      icon: <PieChart size={18} />,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      border: 'border-purple-200 dark:border-purple-800'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Link2 size={20} />
          </div>
          <div className="text-left">
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-100">
              {t('externalLinks')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('externalLinksDesc')}
            </p>
          </div>
        </div>
        <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-slate-100 dark:border-slate-800 mt-2 pt-4">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col justify-between p-4 rounded-xl border ${link.border} bg-white dark:bg-slate-900 hover:shadow-md transition-all hover:-translate-y-0.5`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${link.bg} ${link.color}`}>
                      {link.icon}
                    </div>
                    <ExternalLink size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {link.title}
                  </h4>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExternalLinksToolbar;
