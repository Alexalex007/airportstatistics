import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import HeroSearch from './components/HeroSearch';
import StatsChart from './components/StatsChart';
import AddDataModal from './components/AddDataModal';
import { fetchAirportStats } from './services/geminiService';
import { SearchState, AirportData, AirportDefinition } from './types';
import { AlertCircle, Users, Trash2, Edit, TrendingUp, TrendingDown } from 'lucide-react';

const DEFAULT_AIRPORTS: AirportDefinition[] = [
  { code: 'HKG', name: '香港國際機場' },
  { code: 'TPE', name: '台灣桃園機場' },
  { code: 'SIN', name: '新加坡樟宜機場' },
  { code: 'BKK', name: '曼谷素萬那普機場' },
  { code: 'ICN', name: '首爾仁川機場' }
];

const STORAGE_KEYS = {
  CUSTOM_AIRPORTS: 'skymetrics_custom_airports',
  DATA_PREFIX: 'skymetrics_data_',
  THEME: 'skymetrics_theme'
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

  const [selectedYear, setSelectedYear] = useState<number>(2025);
  
  // Initialize custom airports from LocalStorage
  const [customAirports, setCustomAirports] = useState<AirportDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_AIRPORTS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<{code: string, name: string, data: AirportData | null} | null>(null);

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
           const data = await fetchAirportStats(query, year);
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
  }, [customAirports]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  useEffect(() => {
    loadManualData(selectedYear);
  }, [selectedYear, loadManualData]);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Header onOpenAddModal={openAddModal} theme={theme} onToggleTheme={toggleTheme} />
      
      <main className="flex-grow">
        <HeroSearch 
          onSearch={() => loadManualData(selectedYear)} 
          lastUpdated={lastUpdated}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="flex items-center mb-6 justify-between">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 border-l-4 border-blue-600 pl-4">
               {selectedYear} 年統計概覽
             </h2>
             {customAirports.length > 0 && (
               <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                 包含 {customAirports.length} 個自定義數據源
               </span>
             )}
          </div>

          <div className="space-y-8">
            {allAirports.map((airport) => {
              const state = results[airport.code];
              if (!state && !airport.isCustom) return null;

              const totalPassengers = calculateTotal(state?.data || null);
              const growthRate = calculateGrowth(state?.data || null);

              return (
                <div key={airport.code} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in transition-all relative group hover:shadow-md dark:hover:shadow-slate-800/50">
                  
                  {/* --- Airport Header --- */}
                  <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      
                      {/* Left: Airport Identity */}
                      <div className="flex items-center">
                         <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-white font-bold text-lg shadow-sm mr-4 flex-shrink-0 ${airport.isCustom ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'}`}>
                           {airport.code}
                         </div>
                         <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                              {airport.name}
                            </h2>
                            {airport.isCustom && (
                              <span className="inline-block mt-1 text-[10px] font-medium text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-800">
                                自定義數據
                              </span>
                            )}
                         </div>
                      </div>
                      
                      {/* Right: Stats & Actions */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 mt-1 sm:mt-0 pl-[4rem] sm:pl-0">
                          
                          {/* Total Count */}
                          {state?.isLoading ? (
                            <span className="text-sm text-slate-400 dark:text-slate-500">載入中...</span>
                          ) : (
                            state?.data ? (
                              <div className="flex flex-col sm:items-end">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                                  {selectedYear} 總客運量
                                </span>
                                <div className="flex flex-wrap items-baseline gap-2">
                                   <div className="flex items-center text-slate-800 dark:text-slate-100 font-bold text-lg sm:text-xl">
                                      {new Intl.NumberFormat('zh-TW').format(totalPassengers)}
                                   </div>
                                   
                                   {/* Growth Badge */}
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
                              <span className="text-sm text-slate-400 dark:text-slate-500 italic">暫無 {selectedYear} 數據</span>
                            )
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                              <button 
                                  onClick={() => openEditModal(airport)}
                                  className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all active:scale-95"
                                  title="編輯/更新數據"
                              >
                                  <Edit size={16} className="sm:mr-1.5" />
                                  <span className="hidden sm:inline text-sm font-medium">更新</span>
                              </button>

                              {airport.isCustom && (
                                <button 
                                  onClick={() => removeCustomAirport(airport.code)}
                                  className="flex items-center justify-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all active:scale-95"
                                  title="移除此機場"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                          </div>
                      </div>

                    </div>
                  </div>
                  {/* --- End Header --- */}

                  {/* Content Body */}
                  <div className="p-4 sm:p-6 bg-slate-50/30 dark:bg-slate-950/30">
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
                             title="年度客運量統計"
                             isDarkMode={theme === 'dark'}
                           />
                           
                           {/* Mini Table */}
                           {state.data.chartData.some(d => d.passengers > 0 || (d.comparison && d.comparison > 0)) && (
                             <div className="overflow-hidden border rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-100/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                      <tr>
                                        <th className="px-4 sm:px-6 py-3 whitespace-nowrap">月份</th>
                                        <th className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">{selectedYear} (人次)</th>
                                        <th className="px-4 sm:px-6 py-3 text-right whitespace-nowrap text-slate-400 dark:text-slate-500">{selectedYear - 1} (人次)</th>
                                        <th className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">增長額</th>
                                        <th className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">增長率</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                      {state.data.chartData.map((row, idx) => {
                                          if ((!row.passengers || row.passengers === 0) && (!row.comparison || row.comparison === 0)) return null;

                                          const hasCurrent = row.passengers > 0;
                                          const hasPrev = row.comparison && row.comparison > 0;
                                          
                                          const growth = (hasCurrent && hasPrev) 
                                              ? ((row.passengers - row.comparison!) / row.comparison! * 100).toFixed(1) 
                                              : '-';
                                          
                                          // Calculate growth amount and round to nearest thousand
                                          const growthAmountRaw = (hasCurrent && hasPrev) 
                                              ? (row.passengers - row.comparison!) 
                                              : null;
                                          const growthAmountRounded = growthAmountRaw !== null 
                                              ? Math.round(growthAmountRaw / 1000) * 1000 
                                              : null;
                                              
                                          return (
                                            <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                              <td className="px-4 sm:px-6 py-2.5 font-medium text-slate-900 dark:text-slate-200">{row.period}</td>
                                              <td className="px-4 sm:px-6 py-2.5 text-right font-mono text-slate-700 dark:text-slate-300 font-medium">
                                                  {row.passengers > 0 ? new Intl.NumberFormat('zh-TW').format(row.passengers) : <span className="text-slate-300 dark:text-slate-600">-</span>}
                                              </td>
                                              <td className="px-4 sm:px-6 py-2.5 text-right font-mono text-slate-400 dark:text-slate-500">
                                                  {row.comparison ? new Intl.NumberFormat('zh-TW').format(row.comparison) : <span className="text-slate-200 dark:text-slate-700">-</span>}
                                              </td>
                                              <td className="px-4 sm:px-6 py-2.5 text-right font-mono">
                                                {growthAmountRounded !== null ? (
                                                  <span className={growthAmountRounded >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
                                                    {growthAmountRounded > 0 ? '+' : ''}{new Intl.NumberFormat('zh-TW').format(growthAmountRounded)}
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
                                  </table>
                                </div>
                             </div>
                           )}
                      </div>
                    ) : (
                      // Skeleton Loader
                      state?.isLoading && (
                        <div className="animate-pulse space-y-6">
                           <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
                           <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
      
      <AddDataModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomData}
        currentYear={selectedYear}
        initialData={editingData}
      />

      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 SkyMetrics. 機場數據分析平台.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;