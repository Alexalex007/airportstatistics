import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import HeroSearch from './components/HeroSearch';
import StatsChart from './components/StatsChart';
import AnalysisCard from './components/AnalysisCard';
import { fetchAirportStats } from './services/geminiService';
import { SearchState, AirportData } from './types';
import { AlertCircle, Users } from 'lucide-react';

const AIRPORTS = [
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
  // Initialize state with all airports in loading state so cards appear immediately
  const [results, setResults] = useState<Record<string, SearchState>>(() => {
    const initial: Record<string, SearchState> = {};
    AIRPORTS.forEach(ap => {
      initial[ap.code] = { isLoading: true, error: null, data: null };
    });
    return initial;
  });
  
  const [globalLoading, setGlobalLoading] = useState(true); // Start as true
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);

  const fetchAll = useCallback(async () => {
    setGlobalLoading(true);
    
    // Refresh loading states for all, keeping existing data if available
    setResults(prev => {
      const next: Record<string, SearchState> = {};
      AIRPORTS.forEach(ap => {
        next[ap.code] = { 
          isLoading: true, 
          error: null, 
          data: prev[ap.code]?.data || null 
        };
      });
      return next;
    });

    // Create a promise for each airport to fetch in parallel
    const promises = AIRPORTS.map(async (ap) => {
      try {
        const query = `${ap.code} ${ap.name}`;
        const data = await fetchAirportStats(query);
        
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
    setGlobalLoading(false);
    setLastUpdated(new Date());
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <HeroSearch 
          onSearch={fetchAll} 
          isLoading={globalLoading} 
          lastUpdated={lastUpdated}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="space-y-12">
            {AIRPORTS.map((airport) => {
              const state = results[airport.code];
              if (!state) return null;

              const totalPassengers = calculateTotal(state.data);

              return (
                <div key={airport.code} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                  
                  {/* Airport Header */}
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center mb-2 sm:mb-0">
                       <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mr-3">{airport.code}</span>
                       <h2 className="text-xl font-bold text-slate-800">{airport.name}</h2>
                    </div>
                    {state.isLoading && (
                      <span className="text-sm text-blue-600 flex items-center animate-pulse">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        更新數據中...
                      </span>
                    )}
                    {!state.isLoading && state.data && (
                       <div className="flex items-center text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          <Users size={16} className="mr-2" />
                          <span className="text-sm font-semibold">統計總數: {new Intl.NumberFormat('zh-TW').format(totalPassengers)} 人次</span>
                       </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {state.error && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                          <p className="text-sm text-red-700">{state.error}</p>
                        </div>
                      </div>
                    )}

                    {state.data ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                           <StatsChart 
                             data={state.data.chartData} 
                             title={`${airport.code} 客運量走勢`} 
                           />
                           
                           {/* Mini Table for Exact Numbers */}
                           <div className="mt-6 overflow-x-auto">
                              <table className="min-w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                  <tr>
                                    <th className="px-4 py-2">月份</th>
                                    <th className="px-4 py-2 text-right">本期 (人次)</th>
                                    <th className="px-4 py-2 text-right">去年同期 (人次)</th>
                                    <th className="px-4 py-2 text-right">增長率</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {state.data.chartData.map((row, idx) => {
                                      const growth = row.comparison ? ((row.passengers - row.comparison) / row.comparison * 100).toFixed(1) : '-';
                                      return (
                                        <tr key={idx} className="border-b hover:bg-slate-50">
                                          <td className="px-4 py-2 font-medium text-slate-900">{row.period}</td>
                                          <td className="px-4 py-2 text-right font-mono text-slate-700">{new Intl.NumberFormat('zh-TW').format(row.passengers)}</td>
                                          <td className="px-4 py-2 text-right font-mono text-slate-500">{row.comparison ? new Intl.NumberFormat('zh-TW').format(row.comparison) : '-'}</td>
                                          <td className="px-4 py-2 text-right">
                                            <span className={`${parseFloat(growth) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                              {growth !== '-' && parseFloat(growth) > 0 ? '+' : ''}{growth}%
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                  })}
                                </tbody>
                              </table>
                           </div>
                        </div>
                        
                        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8 pt-6 lg:pt-0">
                          <AnalysisCard 
                            content={state.data.summary} 
                            sources={state.data.sources} 
                          />
                        </div>
                      </div>
                    ) : (
                      // Skeleton Loader when data is null but loading
                      state.isLoading && (
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

      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 SkyMetrics. Powered by Google Search & Gemini 2.5.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;