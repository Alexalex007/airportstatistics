import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AirportLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  airportCode: string;
}

const AIRPORT_LINKS: Record<string, { titleKey: string, url: string }[]> = {
  'TPE': [{ titleKey: 'link_TPE', url: 'https://www.taoyuanairport.com.tw/passengervolume' }],
  'SIN': [{ titleKey: 'link_SIN', url: 'https://www.changiairport.com/en/corporate/about-us/traffic-statistics.html' }],
  'ICN': [{ titleKey: 'link_ICN', url: 'https://www.airport.kr/co_en/4272/subview.do' }],
  'BKK': [{ titleKey: 'link_BKK', url: 'https://investor.airportthai.co.th/transport.html' }],
  'NRT': [{ titleKey: 'link_NRT', url: 'https://www.narita-airport.jp/en/company/airport-operation/operation/' }],
  'HKG': [
    { titleKey: 'link_HKG_press', url: 'https://www.hongkongairport.com/tc/media-centre/press-release/' },
    { titleKey: 'link_HKG_fact', url: 'https://www.hongkongairport.com/tc/the-airport/hkia-at-a-glance/fact-figures.page' }
  ]
};

const AirportLinksModal: React.FC<AirportLinksModalProps> = ({ isOpen, onClose, airportCode }) => {
  const { t } = useLanguage();
  const links = AIRPORT_LINKS[airportCode] || [];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-bold text-lg shadow-sm">
                {airportCode}
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {t('airportLinksTitle')}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {links.length > 0 ? (
              links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <Globe size={18} />
                    </div>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t(link.titleKey as any)}
                    </span>
                  </div>
                  <ExternalLink size={16} className="text-slate-300 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
                </a>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                {t('noData')}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AirportLinksModal;
