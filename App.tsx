import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import HeroSearch from './components/HeroSearch';
import StatsChart from './components/StatsChart';
import AddDataModal from './components/AddDataModal';
import ComparisonModal from './components/ComparisonModal';
import MonthlyComparison from './components/MonthlyComparison';
import LandingPage from './components/LandingPage';
import { fetchAirportStats } from './services/geminiService';
import { SearchState, AirportData, AirportDefinition } from './types';
import { AlertCircle, Trash2, Edit, TrendingUp, TrendingDown, ArrowRight, BarChart2, ChevronDown } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

const DEFAULT_AIRPORTS: AirportDefinition[] = [
  { code: 'HKG', name: '香港國際機場' },
  { code: 'TPE', name: '臺灣桃園國際機場' },
  { code: 'SIN', name: '新加坡樟宜國際機場' },
  { code: 'BKK', name: '曼谷素萬那普國際機場' },
  { code: 'ICN', name: '首爾仁川國際機場' },
  { code: 'MNL', name: '馬尼拉國際機場' }
];

const STORAGE_KEYS = {
  CUSTOM_AIRPORTS: 'skymetrics_custom_airports',
  DATA_PREFIX: 'skymetrics_data_',
  THEME: 'skymetrics_theme',
};

// Helper to calculate total passengers from chart data
const calculateTotal = (data: AirportData | null): number => {
  if (!data || !data.chartData) return 0;
  return data.chartData.reduce((sum, item) => sum + item.passengers, 0);
};

// Helper to calculate Year-to-Date growth rate
const calculateGrowth = (data: AirportData | null): string | null => {
  if (!data || !data.chartData) return null;

  let currentSum = 0;
  let prevSum = 0;
  let hasData = false;

  data.chartData.forEach(item => {
    if (item.passengers > 0) {
      currentSum += item.passengers;
      if (item.comparison) {
        prevSum += item.comparison;
      }
      hasData = true;
    }
  });

  if (!hasData || prevSum === 0) return null;

  const growth = ((currentSum - prevSum) / prevSum) * 100;
  return growth.toFixed(1);
};

const App: React.FC = () => {
  const { t, language } = useLanguage();
  const [hasEntered, setHasEntered] = useState(false);

  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme) return savedTheme as 'light' | 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [expandedAirports, setExpandedAirports] = useState<string[]>([]);

  // Initialize custom airports from LocalStorage
  const [customAirports, setCustomAirports] = useState<AirportDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_AIRPORTS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<{code: string, name: string, data: AirportData | null} | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  useEffect(() => {
    if (isComparisonOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isComparisonOpen]);

  const allAirports = [...DEFAULT_AIRPORTS, ...customAirports];

  const [results, setResults] = useState<Record<string, SearchState>>(() => {
    const initial: Record<string, SearchState> = {};
    DEFAULT_AIRPORTS.forEach(ap => {
      initial[ap.code] = { isLoading: true, error: null, data: null };
    });
    return initial;
  });
  
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_AIRPORTS, JSON.stringify(customAirports));
  }, [customAirports]);

  const loadManualData = useCallback(async (year: number) => {
    const currentAirports = [...DEFAULT_AIRPORTS, ...customAirports];

    setResults(prev => {
        const next = { ...prev };
        currentAirports.forEach(ap => {
             const existing = next[ap.code];
             next[ap.code] = { 
               isLoading: true, 
               error: null, 
               data: existing?.data || null 
             };
        });
        return next;
    });

    const promises = currentAirports.map(async (ap) => {
      try {
        const storageKey = `${STORAGE_KEYS.DATA_PREFIX}${ap.code}_${year}`;
        const savedDataString = localStorage.getItem(storageKey);

        if (savedDataString) {
          const savedData = JSON.parse(savedDataString) as AirportData;
          setResults(prev => ({
            ...prev,
            [ap.code]: { isLoading: false, error: null, data: savedData }
          }));
          return;
        }

        const isDefault = DEFAULT_AIRPORTS.some(d => d.code === ap.code);
        
        if (isDefault) {
           const query = `${ap.code} ${ap.name}`;
           const data = await fetchAirportStats(query, year, language);
           setResults(prev => ({
             ...prev,
             [ap.code]: { isLoading: false, error: null, data }
           }));
        } else {
           setResults(prev => ({
             ...prev,
             [ap.code]: { isLoading: false, error: null, data: null }
           }));
        }

      } catch (err: any) {
        setResults(prev => ({
          ...prev,
          [ap.code]: { isLoading: false, error: err.message, data: null }
        }));
      }
    });

    await Promise.all(promises);
    setLastUpdated(new Date());
  }, [customAirports, language]);

  // --- Auto-Detect Latest Month Logic ---
  useEffect(() => {
    const allLoaded = Object.values(results).every((r: SearchState) => !r.isLoading);
    if (!allLoaded) return;

    let maxMonthIndex = -1;

    Object.values(results).forEach((state: SearchState) => {
      if (state.data && state.data.chartData) {
        state.data.chartData.forEach((point, index) => {
          if (point.passengers > 0) {
            if (index > maxMonthIndex) {
              maxMonthIndex = index;
            }
          }
        });
      }
    });

    if (maxMonthIndex !== -1) {
      setSelectedMonth(maxMonthIndex);
    }
  }, [results, selectedYear]);


  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  useEffect(() => {
    if (hasEntered) {
      loadManualData(selectedYear);
    }
  }, [selectedYear, loadManualData, hasEntered]);

  const handleSaveCustomData = (code: string, name: string, data: AirportData, year: number) => {
    const isDefault = DEFAULT_AIRPORTS.some(ap => ap.code === code);
    const existsInCustom = customAirports.find(ap => ap.code === code);
    
    if (!isDefault && !existsInCustom) {
      setCustomAirports(prev => [...prev, { code, name, isCustom: true }]);
    }

    const storageKey = `${STORAGE_KEYS.DATA_PREFIX}${code}_${year}`;
    localStorage.setItem(storageKey, JSON.stringify(data));

    setResults(prev => ({
      ...prev,
      [code]: { isLoading: false, error: null, data: data }
    }));

    if (year !== selectedYear) {
      setSelectedYear(year);
    }
  };

  const removeCustomAirport = (code: string) => {
    setCustomAirports(prev => prev.filter(ap => ap.code !== code));
    setResults(prev => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
  };

  const openAddModal = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (airport: AirportDefinition) => {
     const currentResult = results[airport.code];
     setEditingData({
         code: airport.code,
         name: airport.name,
         data: currentResult?.data || null
     });
     setIsModalOpen(true);
  };

  const toggleAirportExpansion = (code: string) => {
    setExpandedAirports(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const getMonthlyComparisonData = () => {
    return allAirports.map(airport => {
      const state = results[airport.code];
      if (!state || !state.data || !state.data.chartData) return null;
      
      const point = state.data.chartData[selectedMonth];
      if (!point || point.passengers === 0) return null;

      let growth = undefined;
      if (point.comparison && point.comparison > 0) {
         growth = ((point.passengers - point.comparison) / point.comparison) * 100;
      }

      return {
        code: airport.code,
        name: airport.name,
        value: point.passengers,
        prevValue: point.comparison,
        growth: growth,
        isCustom: airport.isCustom
      };
    }).filter(item => item !== null) as any[];
  };

  if (!hasEntered) {
    return (
      <LandingPage 
        onEnter={() => setHasEntered(true)} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300 animate-in fade-in duration-700">
      <Header 
        onOpenAddModal={openAddModal} 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onHomeClick={() => setHasEntered(false)}
      />
      
      <main className="flex-grow">
        <HeroSearch 
          onSearch={() => loadManualData(selectedYear)} 
          lastUpdated={lastUpdated}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 animate-fade-in-up">
              <button
                onClick={() => setIsComparisonOpen(true)}
                className="flex-1 group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-1 shadow-lg transition-all hover:shadow-xl hover:scale-[1.005] active:scale-[0.99]"
              >
                <div className="relative flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 px-6 py-4 transition-all group-hover:bg-opacity-90 dark:group-hover:bg-opacity-90 h-full">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <BarChart2 size={20} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {t('comparisonLab')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t('comparisonDesc')}</p>
                    </div>
                  </div>
                  <div className="text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </button>
            </div>

            {viewMode === 'monthly' && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                  {t('months').map((m: string, idx: number) => {
                     const isSelected = selectedMonth === idx;
                     return (
                       <button
                         key={idx}
                         onClick={() => setSelectedMonth(idx)}
                         className={`
                            relative flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300
                            border
                            ${isSelected 
                              ? 'text-white border-purple-500 shadow-md transform scale-105' 
                              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'}
                         `}
                       >
                         {isSelected && (
                           <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl -z-10"></div>
                         )}
                         {m}
                       </button>
                     )
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center mb-6 justify-between">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 border-l-4 border-blue-600 pl-4">
               {viewMode === 'yearly' ? `${selectedYear} ${t('overview')}` : t('monthlyRanking')}
             </h2>
             {customAirports.length > 0 && (
               <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                 {customAirports.length} {t('customData')}
               </span>
             )}
          </div>

          {viewMode === 'yearly' && (
            <div className="space-y-4 animate-in fade-in duration-500">
              {allAirports.map((airport) => {
                const state = results[airport.code];
                if (!state && !airport.isCustom) return null;

                const isExpanded = expandedAirports.includes(airport.code);
                const totalPassengers = calculateTotal(state?.data || null);
                const growthRate = calculateGrowth(state?.data || null);

                let footerCurrentSum = 0;
                let footerPrevSum = 0;
                let hasFooterData = false;

                if (state?.data?.chartData) {
                  state.data.chartData.forEach(item => {
                    if (item.passengers > 0) {
                      footerCurrentSum += item.passengers;
                      if (item.comparison) footerPrevSum += item.comparison;
                      hasFooterData = true;
                    }
                  });
                }

                const footerDiff = footerCurrentSum - footerPrevSum;
                const footerGrowthStr = (hasFooterData && footerPrevSum > 0) 
                  ? ((footerCurrentSum - footerPrevSum) / footerPrevSum * 100).toFixed(1) 
                  : '-';

                return (
                  <div key={airport.code} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all relative group hover:shadow-md dark:hover:shadow-slate-800/50">
                    
                    <div 
                       onClick={() => toggleAirportExpansion(airport.code)}
                       className="bg-white dark:bg-slate-900 border-b border-transparent dark:border-transparent cursor-pointer p-5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        
                        <div className="flex items-center">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-white font-bold text-lg shadow-sm mr-4 flex-shrink-0 ${airport.isCustom ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'}`}>
                            {airport.code}
                          </div>
                          <div>
                              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                {state?.data?.airportName || airport.name}
                              </h2>
                              {airport.isCustom && (
                                <span className="inline-block mt-1 text-[10px] font-medium text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-800">
                                  {t('customData')}
                                </span>
                              )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 mt-1 sm:mt-0 pl-[4rem] sm:pl-0">
                            
                            {state?.isLoading ? (
                              <span className="text-sm text-slate-400 dark:text-slate-500">{t('loading')}</span>
                            ) : (
                              state?.data ? (
                                <div className="flex flex-col sm:items-end">
                                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                                    {selectedYear} {t('totalPassengers')}
                                  </span>
                                  <div className="flex flex-wrap items-baseline gap-2">
                                    <div className="flex items-center text-slate-800 dark:text-slate-100 font-bold text-lg sm:text-xl">
                                        {new Intl.NumberFormat('zh-TW').format(totalPassengers)}
                                    </div>
                                    
                                    {growthRate && (
                                      <div className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
                                          parseFloat(growthRate) >= 0 
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                      }`}>
                                        {parseFloat(growthRate) >= 0 ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
                                        {parseFloat(growthRate) > 0 ? '+' : ''}{growthRate}%
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400 dark:text-slate-500 italic">{t('noData')} {selectedYear}</span>
                              )
                            )}

                            <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-slate-400`}>
                               <ChevronDown size={20} />
                            </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 sm:p-6 bg-slate-50/30 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 fade-in duration-300">
                        <div className="flex justify-end gap-2 mb-4">
                             <button 
                                 onClick={(e) => { e.stopPropagation(); openEditModal(airport); }}
                                 className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all text-xs font-bold"
                             >
                                 <Edit size={14} className="mr-1.5" />
                                 {t('editData')}
                             </button>

                             {airport.isCustom && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); removeCustomAirport(airport.code); }}
                                 className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all text-xs font-bold"
                               >
                                 <Trash2 size={14} className="mr-1.5" />
                                 {t('remove')}
                             </button>
                             )}
                        </div>

                        {state?.error && (
                          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-md mb-4">
                            <div className="flex">
                              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                              <p className="text-sm text-red-700 dark:text-red-300">{state.error}</p>
                            </div>
                          </div>
                        )}

                        {state?.data ? (
                          <div className="space-y-6">
                              <StatsChart 
                                data={state.data.chartData} 
                                title={t('yearlyTrend')}
                                isDarkMode={theme === 'dark'}
                              />
                              
                              {state.data.chartData.some(d => d.passengers > 0 || (d.comparison && d.comparison > 0)) && (
                                <div className="overflow-hidden border rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                          <tr>
                                            <th className="px-4 sm:px-6 py-3 whitespace-nowrap">{t('month')}</th>
                                            <th className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">{selectedYear} ({t('passengers')})</th>
                                            <th className="px-4 sm:px-6 py-3 text-right whitespace-nowrap text-slate-400 dark:text-slate-500">{selectedYear - 1} ({t('passengers')})</th>
                                            <th className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">{t('growthAmount')}</th>
                                            <th className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">{t('growth')}</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                          {state.data.chartData.map((row, idx) => {
                                              if ((!row.passengers || row.passengers === 0) && (!row.comparison || row.comparison === 0)) return null;

                                              const hasCurrent = row.passengers > 0;
                                              const hasPrev = row.comparison && row.comparison > 0;
                                              const growth = (hasCurrent && hasPrev) ? ((row.passengers - row.comparison!) / row.comparison! * 100).toFixed(1) : '-';
                                              const growthAmount = (hasCurrent && hasPrev) ? (row.passengers - row.comparison!) : null;
                                                  
                                              return (
                                                <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                                  <td className="px-4 sm:px-6 py-2.5 font-medium text-slate-900 dark:text-slate-200">{t('months')[idx]}</td>
                                                  <td className="px-4 sm:px-6 py-2.5 text-right font-mono text-slate-700 dark:text-slate-300 font-medium">
                                                      {row.passengers > 0 ? new Intl.NumberFormat('zh-TW').format(row.passengers) : <span className="text-slate-300 dark:text-slate-600">-</span>}
                                                  </td>
                                                  <td className="px-4 sm:px-6 py-2.5 text-right font-mono text-slate-400 dark:text-slate-500">
                                                      {row.comparison ? new Intl.NumberFormat('zh-TW').format(row.comparison) : <span className="text-slate-200 dark:text-slate-700">-</span>}
                                                  </td>
                                                  <td className="px-4 sm:px-6 py-2.5 text-right font-mono">
                                                    {growthAmount !== null ? (
                                                      <span className={growthAmount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
                                                        {growthAmount > 0 ? '+' : ''}{new Intl.NumberFormat('zh-TW').format(growthAmount)}
                                                      </span>
                                                    ) : <span className="text-slate-200 dark:text-slate-700">-</span>}
                                                  </td>
                                                  <td className="px-4 sm:px-6 py-2.5 text-right">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                                      growth === '-' ? 'text-slate-300 dark:text-slate-600' :
                                                      parseFloat(growth) > 0 
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                      {growth !== '-' && parseFloat(growth) > 0 ? <TrendingUp size={10} className="mr-1"/> : null}
                                                      {growth !== '-' ? (parseFloat(growth) > 0 ? '+' : '') + growth + '%' : '-'}
                                                    </span>
                                                  </td>
                                                </tr>
                                              );
                                          })}
                                        </tbody>
                                        <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                                          <tr>
                                            <td className="px-4 sm:px-6 py-3 text-slate-800 dark:text-slate-100">{t('yearTotal')}</td>
                                            <td className="px-4 sm:px-6 py-3 text-right font-mono text-slate-800 dark:text-slate-100">
                                              {new Intl.NumberFormat('zh-TW').format(footerCurrentSum)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 text-right font-mono text-slate-400 dark:text-slate-500">
                                              {footerPrevSum > 0 ? new Intl.NumberFormat('zh-TW').format(footerPrevSum) : '-'}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 text-right font-mono">
                                              {hasFooterData && footerPrevSum > 0 ? (
                                                <span className={footerDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
                                                  {footerDiff > 0 ? '+' : ''}{new Intl.NumberFormat('zh-TW').format(footerDiff)}
                                                </span>
                                              ) : <span className="text-slate-300 dark:text-slate-600">-</span>}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 text-right">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                                      footerGrowthStr === '-' ? 'text-slate-300 dark:text-slate-600' :
                                                      parseFloat(footerGrowthStr) > 0 
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                  {footerGrowthStr !== '-' && parseFloat(footerGrowthStr) > 0 ? <TrendingUp size={10} className="mr-1"/> : null}
                                                  {footerGrowthStr !== '-' ? (parseFloat(footerGrowthStr) > 0 ? '+' : '') + footerGrowthStr + '%' : '-'}
                                                </span>
                                            </td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                </div>
                              )}
                          </div>
                        ) : (
                          state?.isLoading && (
                            <div className="animate-pulse space-y-6">
                              <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
                              <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'monthly' && (
             <MonthlyComparison 
               data={getMonthlyComparisonData()}
               year={selectedYear}
               monthIndex={selectedMonth}
               isDarkMode={theme === 'dark'}
             />
          )}

        </div>
      </main>
      
      <AddDataModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomData}
        currentYear={selectedYear}
        initialData={editingData}
      />

      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        allAirports={allAirports}
        results={results}
        year={selectedYear}
      />

      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 SkyMetrics. {t('appSubtitle')}.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;