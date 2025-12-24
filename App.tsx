import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import HeroSearch from './components/HeroSearch';
import StatsChart from './components/StatsChart';
import AnalysisCard from './components/AnalysisCard';
import AddDataModal from './components/AddDataModal'; // Import new modal
import { fetchAirportStats } from './services/geminiService';
import { SearchState, AirportData, AirportDefinition } from './types';
import { AlertCircle, Users, Trash2, Edit } from 'lucide-react';

const DEFAULT_AIRPORTS: AirportDefinition[] = [
  { code: 'HKG', name: '香港國際機場' },
  { code: 'TPE', name: '台灣桃園機場' },
  { code: 'SIN', name: '新加坡樟宜機場' },
  { code: 'BKK', name: '曼谷素萬那普機場' },
  { code: 'ICN', name: '首爾仁川機場' }
];

// Helper to calculate total passengers from chart data
const calculateTotal = (data: AirportData | null): number => {
  if (!data || !data.chartData) return 0;
  return data.chartData.reduce((sum, item) => sum + item.passengers, 0);
};

const App: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [customAirports, setCustomAirports] = useState<AirportDefinition[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<{code: string, name: string, data: AirportData | null} | null>(null);

  // Combine default and custom airports for display
  const allAirports = [...DEFAULT_AIRPORTS, ...customAirports];

  const [results, setResults] = useState<Record<string, SearchState>>(() => {
    const initial: Record<string, SearchState> = {};
    DEFAULT_AIRPORTS.forEach(ap => {
      initial[ap.code] = { isLoading: true, error: null, data: null };
    });
    return initial;
  });
  
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);

  const loadManualData = useCallback(async (year: number) => {
    // Only fetch for DEFAULT airports, keep custom ones as they are (or reset them if needed, but here we preserve structure)
    // We update loading state only for default airports
    setResults(prev => {
        const next = { ...prev };
        DEFAULT_AIRPORTS.forEach(ap => {
            // Only fetch if we don't have custom override (conceptually, though here we just overwrite anyway initially)
            // But let's re-fetch to be safe on year change.
            next[ap.code] = { ...next[ap.code], isLoading: true };
        });
        return next;
    });

    const promises = DEFAULT_AIRPORTS.map(async (ap) => {
      try {
        const query = `${ap.code} ${ap.name}`;
        // Pass the year to the service
        const data = await fetchAirportStats(query, year);
        
        setResults(prev => ({
          ...prev,
          [ap.code]: { isLoading: false, error: null, data }
        }));
      } catch (err: any) {
        setResults(prev => ({
          ...prev,
          [ap.code]: { isLoading: false, error: err.message, data: null }
        }));
      }
    });

    await Promise.all(promises);
    setLastUpdated(new Date());
  }, []);

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // Load data when year changes
  useEffect(() => {
    loadManualData(selectedYear);
  }, [selectedYear, loadManualData]);

  // Handle saving new custom data
  const handleSaveCustomData = (code: string, name: string, data: AirportData, year: number) => {
    // 1. Add to custom airports list if not exists and not in default
    const isDefault = DEFAULT_AIRPORTS.some(ap => ap.code === code);
    const existsInCustom = customAirports.find(ap => ap.code === code);
    
    if (!isDefault && !existsInCustom) {
      setCustomAirports(prev => [...prev, { code, name, isCustom: true }]);
    }

    // 2. Directly inject data into results state
    setResults(prev => ({
      ...prev,
      [code]: { isLoading: false, error: null, data: data }
    }));

    // If the year of input data matches current view, perfect. 
    // If not, we might want to alert user or switch view, but for now we just save it.
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onOpenAddModal={openAddModal} />
      
      <main className="flex-grow">
        <HeroSearch 
          onSearch={() => loadManualData(selectedYear)} 
          lastUpdated={lastUpdated}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="flex items-center mb-6 justify-between">
             <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-4">
               {selectedYear} 年統計概覽
             </h2>
             {customAirports.length > 0 && (
               <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                 包含 {customAirports.length} 個自定義數據源
               </span>
             )}
          </div>

          <div className="space-y-12">
            {allAirports.map((airport) => {
              const state = results[airport.code];
              // If it's a custom airport and we don't have data for this specific year (because user added it for another year), 
              // we might show empty or null.
              if (!state && !airport.isCustom) return null;
              if (airport.isCustom && !state) return null; // Should not happen given logic

              const totalPassengers = calculateTotal(state?.data || null);

              return (
                <div key={airport.code} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in transition-all relative group">
                  
                  {/* Airport Header */}
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center mb-2 sm:mb-0">
                       <span className={`${airport.isCustom ? 'bg-purple-600' : 'bg-blue-600'} text-white text-xs font-bold px-2 py-1 rounded mr-3`}>
                         {airport.code}
                       </span>
                       <h2 className="text-xl font-bold text-slate-800">
                         {airport.name} 
                         {airport.isCustom && <span className="ml-2 text-xs font-normal text-purple-600 border border-purple-200 bg-purple-50 px-2 py-0.5 rounded">自定義</span>}
                       </h2>
                    </div>
                    
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {state?.isLoading ? (
                          <span className="text-sm text-slate-400">更新中...</span>
                        ) : (
                          state?.data && (
                           <div className="hidden sm:flex items-center text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mr-2">
                              <Users size={16} className="mr-2" />
                              <span className="text-sm font-semibold">
                                {selectedYear} 總數: {new Intl.NumberFormat('zh-TW').format(totalPassengers)}
                              </span>
                           </div>
                          )
                        )}
                        
                        <button 
                            onClick={() => openEditModal(airport)}
                            className="flex items-center space-x-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
                            title="編輯/更新數據"
                        >
                            <Edit size={14} />
                            <span>更新數據</span>
                        </button>

                        {airport.isCustom && (
                          <button 
                            onClick={() => removeCustomAirport(airport.code)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-md"
                            title="移除此數據"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {state?.error && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                          <p className="text-sm text-red-700">{state.error}</p>
                        </div>
                      </div>
                    )}

                    {state?.data ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                           <StatsChart 
                             data={state.data.chartData} 
                             title={`${airport.code} ${selectedYear} 客運量走勢`} 
                           />
                           
                           {/* Mini Table for Exact Numbers */}
                           {state.data.chartData.some(d => d.passengers > 0) && (
                             <div className="mt-6 overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-slate-500">
                                  <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                    <tr>
                                      <th className="px-4 py-2">月份</th>
                                      <th className="px-4 py-2 text-right">{selectedYear} (人次)</th>
                                      <th className="px-4 py-2 text-right">{selectedYear - 1} (人次)</th>
                                      <th className="px-4 py-2 text-right">增長率</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {state.data.chartData.map((row, idx) => {
                                        if (row.passengers === 0 && (!row.comparison || row.comparison === 0)) return null; // Skip empty rows

                                        const growth = row.comparison && row.comparison > 0 ? ((row.passengers - row.comparison) / row.comparison * 100).toFixed(1) : '-';
                                        return (
                                          <tr key={idx} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-2 font-medium text-slate-900">{row.period}</td>
                                            <td className="px-4 py-2 text-right font-mono text-slate-700">{new Intl.NumberFormat('zh-TW').format(row.passengers)}</td>
                                            <td className="px-4 py-2 text-right font-mono text-slate-500">{row.comparison ? new Intl.NumberFormat('zh-TW').format(row.comparison) : '-'}</td>
                                            <td className="px-4 py-2 text-right">
                                              <span className={`${parseFloat(growth) > 0 ? 'text-green-600' : parseFloat(growth) < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                                {growth !== '-' && parseFloat(growth) > 0 ? '+' : ''}{growth}%
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                    })}
                                  </tbody>
                                </table>
                             </div>
                           )}
                        </div>
                        
                        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8 pt-6 lg:pt-0">
                          <AnalysisCard 
                            content={state.data.summary} 
                            sources={state.data.sources} 
                          />
                        </div>
                      </div>
                    ) : (
                      // Skeleton Loader
                      state?.isLoading && (
                        <div className="animate-pulse space-y-6">
                           <div className="h-64 bg-slate-100 rounded-xl"></div>
                           <div className="h-24 bg-slate-100 rounded-xl"></div>
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

      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 SkyMetrics. 機場數據分析平台.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;